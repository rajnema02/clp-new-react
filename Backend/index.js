const express = require('express');
const morgan = require('morgan');
require('dotenv').config();
require('./Helpers/init_mongodb');
const cors = require('cors');
const path = require('path');
const compression = require('compression');
const createError = require('http-errors');

const app = express();

// Add this validation right after
const requiredEnvVars = ['ACCESS_TOKEN_SECRET', 'REFRESH_TOKEN_SECRET', 'MONGO_URL'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}
// console.log('✅ Environment variables loaded successfully');

// Middleware setup
if (process.env.ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Safe route loader
const loadRoute = (path, routePath) => {
  try {
    const router = require(path);
    app.use(routePath, router);
    console.log(`✓ Route loaded: ${routePath}`);
  } catch (err) {
    console.error(`✗ Failed to load ${routePath}:`, err.message);
    if (err.message.includes('path-to-regexp')) {
      console.error('  → Check for invalid route paths in this file');
    }
  }
};

// API Routes Start ------
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

// API Routes End --------

// // Load all routes
// console.log('\nLoading routes:');
// loadRoute('./Routes/Auth.route', '/auth');
// loadRoute('./Routes/User.route', '/user');
// loadRoute('./Routes/File.route', '/file');
// loadRoute('./Routes/QuestionFile.route', '/questionFile');
// loadRoute('./Routes/Department.route', '/department');
// loadRoute('./Routes/Page.route', '/page');
// loadRoute('./Routes/AboutProgram.route', '/about-program');
// loadRoute('./Routes/Course.route', '/course');
// loadRoute('./Routes/StudyMaterial.route', '/study');
// loadRoute('./Routes/Category.route', '/category');
// loadRoute('./Routes/Batch.route', '/batch');
// loadRoute('./Routes/Question.route', '/question');
// loadRoute('./Routes/Exam.route', '/exam');
// loadRoute('./Routes/ActivityLog.route', '/activityLog');
// loadRoute('./Routes/AsnwerSheet.route', '/answerSheet'); // Note: Fix typo in filename
// loadRoute('./Routes/ExamReport.route', '/examReport');
// loadRoute('./Routes/Message.route', '/message');
// loadRoute('./Routes/Certificate.route', '/certificate');
// loadRoute('./Routes/MakePayment.route', '/makePayment');
// loadRoute('./Routes/Payment.route', '/payment');
// loadRoute('./Routes/RegistrationRefInfo.route', '/registrationInfo');
// loadRoute('./Routes/Center.route', '/center');
// loadRoute('./Routes/knowledge.route', '/knowledge');
// loadRoute('./Routes/CourseModule.route', '/coursemodule');
// loadRoute('./Routes/LatestEvent.route', '/latestEvent');
// loadRoute('./Routes/AuditQuesCategory.route', '/auditCategory');
// loadRoute('./Routes/AuditQuestion.route', '/auditQuestion');
// loadRoute('./Routes/AuditQueryQuestion.route', '/auditQuestionQuery');
// loadRoute('./Routes/AuditExam.route', '/auditExam');
// console.log('');

// Error handlers
app.use((req, res, next) => next(createError(404)));
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ error: err.message });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\nServer running on port ${PORT}`);
  console.log(`Connected to MongoDB: ${process.env.MONGO_URL}/${process.env.DB_NAME}\n`);
});