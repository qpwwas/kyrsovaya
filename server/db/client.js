import mongoose from 'mongoose'

const defaultDatabaseName = 'sportspace'
const defaultMongoUri = `mongodb://127.0.0.1:27017/${defaultDatabaseName}`

export async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection
  }

  const mongoUri = process.env.MONGODB_URI ?? defaultMongoUri

  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 5000,
  })

  return mongoose.connection
}

export async function disconnectFromDatabase() {
  if (mongoose.connection.readyState === 0) {
    return
  }

  await mongoose.disconnect()
}
