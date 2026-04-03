import mongoose from 'mongoose'
import { createApp } from './app.js'

const port = Number(process.env.PORT ?? 3001)
const host = process.env.HOST ?? '0.0.0.0'
const mongoUri = process.env.MONGO_URI

async function bootstrap() {
  if (!mongoUri) {
    throw new Error('MONGO_URI is not set in environment variables')
  }

  await mongoose.connect(mongoUri)
  console.log('MongoDB connected')

  const app = createApp()

  app.listen(port, host, () => {
    console.log(`SportSpace is running on http://${host}:${port}`)
  })
}

bootstrap().catch((error) => {
  console.error('Failed to start SportSpace with MongoDB:', error)
  process.exit(1)
})