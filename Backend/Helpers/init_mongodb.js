const mongoose = require('mongoose')
const debug = require('debug')(`${process.env.DB_Name || 'mongo'}:db`)
require('dotenv').config()

const DB_NAME = process.env.DB_Name || 'cl-new-react'
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/'

const FULL_DB_URL = `${MONGO_URL}${DB_NAME}`

// ✅ No need for deprecated options like useNewUrlParser, useUnifiedTopology
mongoose.connect(FULL_DB_URL)
  .then(() => debug(`✅ MongoDB connected at ${FULL_DB_URL}`))
  .catch((err) => console.error('❌ MongoDB connection error:', err))

const db = mongoose.connection

db.on('disconnected', () => {
  debug('⚠️ MongoDB disconnected')
})

process.on('SIGINT', async () => {
  await mongoose.connection.close()
  debug('🔌 MongoDB connection closed due to app termination')
  process.exit(0)
})
