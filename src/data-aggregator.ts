import 'dotenv/config'
import { parseJSON } from 'date-fns'
import { Client, SSLMode, SSL } from 'ts-postgres'
import { Connection, Keypair, PublicKey } from '@solana/web3.js'
import { AnchorProvider, Wallet } from '@coral-xyz/anchor'
import { OpenBookV2Client, OPENBOOK_PROGRAM_ID, LeafNode } from '@openbook-dex/openbook-v2'

const HOST = process.env.DB_HOST
const PORT = process.env.DB_PORT
const USER = process.env.DB_USER
const PASSWORD = process.env.DB_PASSWORD
const DB = process.env.DB_DATABASE
const ENDPOINT = process.env.RPC_URL as string
const MARKET = new PublicKey('77PdwysfzmE1QBd66bGf9k7xnfSh8MDEiCxjeY8psJPH')

require('dotenv').config({ debug: true })

const connection = () => {
  return new Connection(ENDPOINT)
}

const _wallet = () => {
  return new Wallet(new Keypair())
}

const provider = () => {
  return new AnchorProvider(connection(), _wallet(), {})
}

const openBookClient = () => {
  return new OpenBookV2Client(provider(), OPENBOOK_PROGRAM_ID)
}

const getSide = (side: LeafNode[], isBidSide?: boolean) => {
  if (side.length === 0) {
    return null;
  }
  const parsed = side
    .map((e) => ({
      price: e.key.shrn(64).toNumber(),
      size: e.quantity.toNumber(),
    }))
    .sort((a, b) => a.price - b.price);

  const sorted = isBidSide
    ? parsed.sort((a, b) => b.price - a.price)
    : parsed.sort((a, b) => a.price - b.price);

  const deduped = new Map();
  sorted.forEach((order) => {
    if (deduped.get(order.price) === undefined) {
      deduped.set(order.price, order.size);
    } else {
      deduped.set(order.price, deduped.get(order.price) + order.size);
    }
  });

  const total = parsed.reduce((a, b) => ({
    price: a.price + b.price,
    size: a.size + b.size,
  }));
  return { parsed, total, deduped };
};

const orderBookSide = (orderBookForSide: LeafNode[], isBidSide?: boolean) => {
  if (orderBookForSide) {
    const _orderBookSide = getSide(orderBookForSide, isBidSide);
    if (_orderBookSide) {
      return Array.from(_orderBookSide.deduped?.entries()).map((side) => [
        (side[0] / 10_000).toFixed(4),
        side[1],
      ]);
    }
  }
  if (isBidSide) {
    return [[0, 0]];
  }
  return [[Number.MAX_SAFE_INTEGER, 0]];
};

const main = async() => {
  const client = new Client({
    host: HOST,
    user: USER,
    password: PASSWORD,
    database: DB,
    ssl: SSLMode.Disable, //SSLMode.Require as SSL,
    keepAlive: true
  })
  try {
    await client.connect()
    console.log("connected")
    // const markets = await findAllMarkets(connection(), OPENBOOK_PROGRAM_ID, provider())
    const marketDetails = await openBookClient().getMarketAccount(MARKET)
    let marketBeginTime = 0
    if (marketDetails) {
      marketBeginTime = marketDetails.registrationTime.toNumber()
      const bids = await openBookClient().getBookSide(marketDetails?.bids)
      const asks = await openBookClient().getBookSide(marketDetails?.asks)
      
      if (bids) {
        const _bids = openBookClient().getLeafNodes(bids)
        const parsedBids = orderBookSide(_bids, true)
        console.log(parsedBids)
      }
      if (asks) {
        const _asks = openBookClient().getLeafNodes(asks)
        const parsedAsks = orderBookSide(_asks)
        console.log(parsedAsks)
      }
      
      
    }
    // TODO: To go back we have to parse signatures and the transaction details to
    // handle the results
    console.log(`Need to look back to ${marketBeginTime} blockTime`)

    // TODO: This may not be the thing to be querying against, could be the books market vs this...
    const signatures = await connection().getSignaturesForAddress(MARKET, {})
    // TODO: handle slot / blocktime such that we stop when market was created...
    const lastSignatureReturned = signatures.pop()
    if (lastSignatureReturned) {
      if(lastSignatureReturned?.blockTime && lastSignatureReturned?.blockTime > marketBeginTime) {
        // TODO: Get the signature and look back from there.. Loop until done
        console.log(`Still need to loop...`)
        console.log(lastSignatureReturned)
        // TODO: Will need to consume and parse each of these to be able to build the data...
        // This may be a work backwards approach to collecting the data (from current book) to previous
        const transaction = await connection().getTransaction(lastSignatureReturned.signature, {
          maxSupportedTransactionVersion: 1
        })
        console.log(transaction)
      } else [
        console.log('finished')
      ]
    }
  } catch(e) {
    console.error(e)
  }
}

main()