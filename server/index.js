import { createApp } from './app.js'
import { ensureDatabaseReady } from './db/init.js'

const port = Number(process.env.PORT ?? 3001)

ensureDatabaseReady()

const app = createApp()

app.listen(port, () => {
  console.log(`SportSpace API is running on http://localhost:${port}`)
})
