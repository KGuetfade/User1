const mongoose = require('mongoose')

const CoinbaseProSchema = new mongoose.Schema({
    original: String,
    pair1: String,
    pair2: String,
    pair1_price: Number,
    pair2_price: Number,
    original_price: Number,
    triangular_price: Number,
    percentage: Number,
    time: {
        type: Date,
        index: true
    }
})

const CoinbaseProModel = new mongoose.model('coinbase', CoinbaseProSchema)

module.exports = CoinbaseProModel