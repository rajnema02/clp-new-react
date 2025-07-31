const mongoose = require('mongoose')

const StudySchema = new mongoose.Schema({

    course_name: {
        type: String,
    },
    fileType:{
        type: String
    },
    yt_link: {
        type: String,
    },
    video_link: {
        type: String,
    },
    title: {
        type: String,
    },
    pdf_link: {
        type: String,
    },
    pdf_title: {
        type: String,
    },
    description: {
        type: String,
    },

    created_at: {
        type: Date,
        default: Date.now()
    },
    updated_at: {
        type: Date
    },
    is_inactive: {
      type: Boolean,
      default: false
  },

})

const Study = mongoose.model('study', StudySchema)

module.exports = Study