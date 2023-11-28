import 'dotenv/config'
import { parseJSON } from 'date-fns'
import { Client, SSLMode, SSL } from 'ts-postgres'

const HOST = process.env.DB_HOST
const PORT = process.env.DB_PORT
const USER = process.env.DB_USER
const PASSWORD = process.env.DB_PASSWORD
const DB = process.env.DB_DATABASE

require('dotenv').config({ debug: true })

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
    } catch(e) {
        console.error(e)
    }
}

main()