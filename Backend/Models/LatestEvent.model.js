const mongoose = require('mongoose')

const LatestEventSchema = new mongoose.Schema({
    file: {
        type: String,
    },
    title: {
        type: String,
    },
    updated_at: {
        type: Date
    },
    created_at: {
        type: Date
    },
    created_by: {
        type: mongoose.Types.ObjectId
    },
})
const LatestEvent = mongoose.model('latestEvent', LatestEventSchema)

module.exports = LatestEvent