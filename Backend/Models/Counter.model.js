const mongoose = require('mongoose');

const CounterSchema = mongoose.Schema({
    _id: {
        type: String
    },
    sequence_value: {
        type: Number,
        default: 1
    },
    created_at: {
        type: Date,
        default: Date.now()
    },
    updated_at: {
        type: Date
    }

});

const Counter = module.exports = mongoose.model('Counter', CounterSchema);

module.exports.getNextSequenceValue = async function (sequenceName) {
    const datum = await Counter.findOne({ _id: sequenceName },{_id: 1});
    if (!datum) {
        let newcounter = new Counter({ _id: sequenceName })
        await newcounter.save();
    }
    const data = await Counter.findOneAndUpdate({ _id: sequenceName }, {
        $inc: {
            sequence_value: 1
        }
    }, { new: true });
    return data;
}