import { serve } from "@hono/node-server"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import { auth } from "@/lib/auth"
import { env } from "@/lib/env"
import { tasks } from "@/routes/tasks"

const api = new Hono()

api.use(
  "*",
  cors({
    origin: [env.FRONTEND_URL],
    credentials: true,
  })
)

api.use(logger())

api.on(["POST", "GET"], "/api/auth/*", (c) => {
  return auth.handler(c.req.raw)
})

api.route("/api/tasks", tasks)

serve(
  {
    fetch: api.fetch,
    port: env.PORT,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`)
  }
)
