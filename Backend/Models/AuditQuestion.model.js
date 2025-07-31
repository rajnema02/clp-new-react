const mongoose = require('mongoose')

const AuditQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        trim: true,
        required: true
    },
    priority: {
        type: String,
    },
    risk: {
        type: String,
    },
    suggestion: {
        type: String,
    },
    questionType: {
        type: String,
        default:'Individual',
        enum:['Assessor', 'Individual']
    },
    question_category: {
        type: mongoose.Types.ObjectId
    },
    disabled: {
        type: Boolean,
        default: false
    },
    is_inactive: {
        type: Boolean,
        default: false
    },
    created_at: {
        type: Date
    },
    created_by: {
        type: mongoose.Types.ObjectId
    },
    updated_at: {
        type: Date
    },
    deleted_at: {
        type: Date
    },
    restored_at: {
        type: Date
    }
},
    { timestamps: true }
)

const AuditQuestion = mongoose.model('auditQuestion', AuditQuestionSchema)

module.exports = AuditQuestion