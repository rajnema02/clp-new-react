const express = require('express')
const morgan = require('morgan')
require('dotenv').config()
require('./Helpers/init_mongodb') // Initialize MongoDB connection
const cors = require('cors')
const path = require('path')
const compression = require('compression')
const createError = require('http-errors')
const debug = require('debug')(`${process.env.DB_Name || 'debug'}:server`)
const XLSX = require('xlsx') // If needed for file processing

const app = express()

// Middleware: Logger (only in development)
if (process.env.ENV === 'development') {
  app.use(morgan('dev'))
}

// Middleware: CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}))

// Middleware: Compression
function shouldCompress(req, res) {
  if (req.headers['x-no-compression']) {
    return false
  }
  return compression.filter(req, res)
}
app.use(compression({ filter: shouldCompress }))

// Middleware: Body parsing
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// API ROUTES
app.use('/auth', require('./Routes/Auth.route'))
app.use('/user', require('./Routes/User.route'))
app.use('/file', require('./Routes/File.route'))
app.use('/questionFile', require('./Routes/QuestionFile.route'))
app.use('/department', require('./Routes/Department.route'))
app.use('/page', require('./Routes/Page.route'))
app.use('/about-program', require('./Routes/AboutProgram.route'))
app.use('/course', require('./Routes/Course.route'))
app.use('/study', require('./Routes/StudyMaterial.route'))
app.use('/category', require('./Routes/Category.route'))
app.use('/batch', require('./Routes/Batch.route'))
app.use('/question', require('./Routes/Question.route'))
app.use('/exam', require('./Routes/Exam.route'))
app.use('/activityLog', require('./Routes/ActivityLog.route'))
app.use('/answerSheet', require('./Routes/AsnwerSheet.route'))
app.use('/examReport', require('./Routes/ExamReport.route'))
app.use('/message', require('./Routes/Message.route'))
app.use('/certificate', require('./Routes/Certificate.route'))
app.use('/makePayment', require('./Routes/MakePayment.route'))
app.use('/payment', require('./Routes/Payment.route'))
app.use('/registrationInfo', require('./Routes/RegistrationRefInfo.route'))
app.use('/center', require('./Routes/Center.route'))
app.use('/knowledge', require('./Routes/knowledge.route'))
app.use('/coursemodule', require('./Routes/CourseModule.route'))
app.use('/latestEvent', require('./Routes/LatestEvent.route'))
app.use('/auditCategory', require('./Routes/AuditQuesCategory.route'))
app.use('/auditQuestion', require('./Routes/AuditQuestion.route'))
app.use('/auditQuestionQuery', require('./Routes/AuditQueryQuestion.route'))
app.use('/auditExam', require('./Routes/AuditExam.route'))

// View Engine Setup (EJS)
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

// Static Files (e.g., frontend build)
app.use(express.static(path.join(__dirname, 'public/dist')))

// Error Handler (404)
app.use((req, res, next) => {
  next(createError(404, 'Resource Not Found'))
})

// Error Handler (500)
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({
    error: {
      message: err.message,
      status: err.status || 500
    }
  })
})

// Start Server
const PORT = process.env.PORT || 3000
const URL = process.env.MONGO_URL
const DB_NAME = process.env.DB_NAME
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
  console.log(`${URL} DB Name ${DB_NAME}`)
})