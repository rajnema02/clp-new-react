const mongoose = require('mongoose');
const MessageSchema = new mongoose.Schema({

    message_description: {
        type: String,
        require: true
    },
    alert_message: {
        type: Boolean,
        default: false
    },
    file_path:{
        type: String,
    },
    message_file: {
    type: String,
    required: true
},
    batch_id: {
        type: mongoose.Types.ObjectId
    },
    student_id: {
        type: mongoose.Types.ObjectId
    },
    disable: {
        type: Boolean,
        default: false
    },
    is_inactive: {
        type: Boolean,
        default: false
    },
    created_by: {
        type: mongoose.Types.ObjectId
    },
    updated_at: {
        type: Date
    },
    created_on: {
        type: Date
    }
})

const Message = mongoose.model('message', MessageSchema)

module.exports = Message