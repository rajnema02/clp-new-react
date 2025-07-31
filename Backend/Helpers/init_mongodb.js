require('dotenv').config()
const mongoose = require('mongoose')
const debug = require('debug')(process.env.DEBUG + 'mongodb')

const FULL_URI = `${process.env.MONGO_URL}${process.env.DB_NAME}`

mongoose.connect(FULL_URI)
  .then(() => debug(`✅ MongoDB connected to ${FULL_URI}`))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message)
    process.exit(1)
  })

mongoose.connection.on('connected', () => {
  debug(`Mongoose connected to DB: ${process.env.DB_NAME}`)
})

mongoose.connection.on('error', (err) => {
  debug('Mongoose error:', err.message)
})

mongoose.connection.on('disconnected', () => {
  debug('Mongoose connection is disconnected.')
})

process.on('SIGINT', async () => {
  await mongoose.connection.close()
  debug('MongoDB connection closed due to app termination')
  process.exit(0)
})
