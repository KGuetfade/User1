const mongoose = require('mongoose')

const ArbitrageSchema = new mongoose.Schema({    
    percentage: Number,
    steps: {
        type: [Object],
        default: []
    },
    time: {
        type: Date,
        index: true
    }
})

const ArbitrageModel = new mongoose.model("arbitrages", ArbitrageSchema)

module.exports = ArbitrageModel