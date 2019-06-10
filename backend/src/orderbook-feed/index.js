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
            this.logPerformance()
            this.onMessage(this.syncOrderbooks)            
        })
    }

    stop() {
        this.syncOrderbooks.removeAllListeners()
        this.syncOrderbooks.socket.removeAllListeners()
        this.syncOrderbooks.socket = null
        this.syncOrderbooks = null
    }

    logPerformance() {
        if (!this.startTime) {
            console.log(`[${new Date()}] Starting performance check`)
            this.startTime = new Date().getTime()
            this.ticks = 0
            return
        }

        this.now = new Date().getTime()
        this.ticks++
        if (this.now - this.startTime >= 1000 * 60) {
            console.log(`[${new Date()}] Performance: ${this.ticks} ticks`)
            this.startTime = this.now
            this.ticks = 0
        }
    }
}

module.exports = OrderbookFeed