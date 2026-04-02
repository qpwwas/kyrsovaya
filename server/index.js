import { createApp } from './app.js'
import { ensureDatabaseReady } from './db/init.js'

const port = Number(process.env.PORT ?? 3001)
const host = process.env.HOST ?? '0.0.0.0'

ensureDatabaseReady()

const app = createApp()

app.listen(port, host, () => {
  console.log(`SportSpace is running on http://${host}:${port}`)
})
