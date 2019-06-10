const config = require('../configuration')
const WebSocket = require('ws')

const url = config.get("COINBASE_PRO_WS_URL")

class Coinbase {
    constructor(productIDs) {
        this.url = url
    }
}

module.exports = exports = Coinbase