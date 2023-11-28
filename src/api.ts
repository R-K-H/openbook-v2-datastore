import Cors from 'cors'
import * as Env from 'dotenv'
import envExpand from 'dotenv-expand'
import Express from 'express'
import RateLimit from 'express-rate-limit'
import Helmet from 'helmet'
import Morgan from 'morgan'
import timeout from 'connect-timeout'
import { DataType } from 'ts-postgres'
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'

envExpand(Env.config())
// Express rate limiter
const limitWindowMS = parseInt(process.env.LIMIT_WINDOW_MS ? process.env.LIMIT_WINDOW_MS : '60000');
const limitRequests = parseInt(process.env.LIMIT_REQUESTS ? process.env.LIMIT_REQUESTS : '25');

const limiter = RateLimit({
  windowMs: limitWindowMS,
  max: limitRequests, // Limit each IP to X requests per `window` (here, per 1 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

function haltOnTimedout(req, res, next) {
  if (!req.timedout) next()
}

const app = Express()

// prebuild middlewares
app.use(Cors()) // Enable All CORS Requests
app.use(Helmet()) // Securing Express apps by setting various HTTP headers
app.use(Morgan('tiny')) // HTTP request logger
app.use(Express.json()) // It parses incoming requests with JSON payloads and is based on body-parser
app.use(limiter) // Basic rate-limiting middleware
app.use(timeout(30000)) // Timeout
app.use(haltOnTimedout) // Timeout halt

// Api route
// @ts-ignore
app.get('/', async (req, res) => {
  res.text('Works')
})

// Port number (reading port from .env file)
const port = parseInt(process.env.PORT ? process.env.PORT : '8080')
const host = process.env.HOST ? process.env.HOST : '127.0.0.1'
app.listen(port, host, () => {
  console.log(`listening on port ${port}`)
})