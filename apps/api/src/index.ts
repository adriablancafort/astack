import 'dotenv/config';
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from "hono/cors"
import { logger } from 'hono/logger'
import { auth } from "./lib/auth.js"

const app = new Hono()

const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:5173"
const port = Number(process.env.PORT ?? "3000")

app.use(
  "*",
  cors({
    origin: [frontendUrl],
    credentials: true,
  })
)

app.use(logger())

app.on(["POST", "GET"], "/api/auth/*", (c) => {
    return auth.handler(c.req.raw);
});

serve({
  fetch: app.fetch,
  port
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
