const mongoose = require('mongoose')

const CoinbaseProSchema = new mongoose.Schema({
    steps: {
        type: [Object],
        default: []
    },
    percentage: Number,
    time: {
        type: Date,
        index: true
    },
    duration: Number
})

const CoinbaseProModel = new mongoose.model("coinbase", CoinbaseProSchema)

module.exports = CoinbaseProModel