const mongoose = require('mongoose')

const AuditQuestionSchema = new mongoose.Schema({
    // batch_id: {
    //     type: mongoose.Types.ObjectId
    // },
    question_category: {
        type: mongoose.Types.ObjectId
    },
    question_id: {
        type: mongoose.Types.ObjectId
    },
    applicant_query: {
        type: String
    },
    reply: {
        type: String
    },
    reply_docs: {
        type: String
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

const AuditQuestion = mongoose.model('auditQuestionQuery', AuditQuestionSchema)

module.exports = AuditQuestion