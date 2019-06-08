const CoinbasePro = require('coinbase-pro')
const EventEmitter = require('events')

class OrderbookFeed {
    constructor({ products, onMessage }) {
        this.products = products
        this.onMessage = onMessage
        this.syncOrderbooks = new CoinbasePro.OrderbookSync(products);
    }

    start() {
        this.syncOrderbooks.on('message', data => {
            this.onMessage(this.syncOrderbooks)
        })
    }

    stop() {
        this.syncOrderbooks.removeAllListeners()
        this.syncOrderbooks.socket.removeAllListeners()
        this.syncOrderbooks.socket = null
        this.syncOrderbooks = null
    }
}

module.exports = OrderbookFeed