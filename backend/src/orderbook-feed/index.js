const CoinbasePro = require('coinbase-pro')
const EventEmitter = require('events')
const BigNumber = require('bignumber.js')

class OrderbookFeed extends EventEmitter{
    constructor(products) {
        super()
        this.products = products
        this.syncOrderbooks = new CoinbasePro.OrderbookSync(products);
        this.lastState = {}

        //
        this.messages = 0
        setInterval(() => {
            console.log(`${new Date()} Orderbook messages: ${this.messages}`)
            this.messages = 0
        }, 1000 * 60 * 20)


        this.syncOrderbooks.on('message', data => {
            this.messages += 1
            this.checkForUpdates(data)
        })

        //
        this.updates = 0
        setInterval(() => {
            console.log(`${new Date()} Orderbook updates: ${this.updates}`)
            this.updates = 0
        }, 1000 * 60 * 20)
    }

    /**
     * Currently just checks if anything has changed across
     * all orderbooks.
     */
    checkForUpdates(data) {
        for (let i = 0; i < this.products.length; i++) {
            const product = this.products[i]
            const book = this.syncOrderbooks.books[product].state()
            const hasChanged = this.hasChanged(product, book)
            if (hasChanged) { 
                this.updates += 1
                this.emit('update', this.syncOrderbooks)
                break
            }
        }
    }

    /**
     * Checks if the top bids and asks of the orderbook have changed.
     */
    hasChanged(productId, book) {
        const lastState = this.lastState[productId]
        const topBid = book['bids'][0]
        const topAsk = book['asks'][0]    

        if (topBid === undefined || topAsk === undefined) { return false }
        if (lastState === undefined) { 
            this.lastState[productId] = { topBid, topAsk }
            return false
        }

        if (!lastState.topBid.price.isEqualTo(topBid.price)) { this.lastState[productId] = { topBid, topAsk }; return true }
        if (!lastState.topBid.size.isEqualTo(topBid.size)) { this.lastState[productId] = { topBid, topAsk }; return true }
        if (!lastState.topAsk.price.isEqualTo(topAsk.price)) { this.lastState[productId] = { topBid, topAsk }; return true }
        if (!lastState.topAsk.size.isEqualTo(topAsk.size)) { this.lastState[productId] = { topBid, topAsk }; return true }

        return false
    }

    clean() {
        this.syncOrderbooks.removeAllListeners()
        this.syncOrderbooks.socket.removeAllListeners()
        this.syncOrderbooks.socket = null
        this.syncOrderbooks = null
    }
}

module.exports = OrderbookFeed