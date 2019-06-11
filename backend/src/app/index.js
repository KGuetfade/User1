const { Coinbase, Binance } = require('../socket-feed')
const OrderbookFeed = require('../orderbook-feed')

class App {
    constructor() {

    }

    start() {
        const orderbook = new OrderbookFeed(['BTC-EUR'])
    }
}

module.exports = exports = App