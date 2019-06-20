const mongoose = require('mongoose')

const NetTradeSchema = new mongoose.Schema({    
    net: {
        type: [Object],
        default: []
    },
    time: {
        type: Date,
        index: true
    }
})

const NetTradeModel = new mongoose.model("trades", NetTradeSchema)

module.exports = NetTradeModel