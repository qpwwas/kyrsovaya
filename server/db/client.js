import mongoose from 'mongoose'

let isConnected = false

export async function connectToDatabase() {
  const mongoUri = process.env.MONGO_URI ?? process.env.MONGODB_URI

  if (!mongoUri) {
    throw new Error('MongoDB URI is not set. Use MONGO_URI or MONGODB_URI.')
  }

  if (isConnected) {
    return mongoose.connection
  }

  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 45000,
  })

  isConnected = true
  console.log('MongoDB connected')

  return mongoose.connection
}
