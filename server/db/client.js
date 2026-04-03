import mongoose from 'mongoose'

let isConnected = false

export async function connectToDatabase() {
  const mongoUri = process.env.MONGO_URI

  if (!mongoUri) {
    throw new Error('MONGO_URI is not set in environment variables')
  }

  if (isConnected) {
    return mongoose.connection
  }

  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 10000,
  })

  isConnected = true
  console.log('MongoDB connected')

  return mongoose.connection
}