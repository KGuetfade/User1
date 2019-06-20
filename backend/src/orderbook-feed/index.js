const CoinbasePro = require('coinbase-pro')
const EventEmitter = require('events')

class OrderbookFeed extends EventEmitter{
    constructor(products) {
        super()
        this.products = products
        this.syncOrderbooks = new CoinbasePro.OrderbookSync(products);     
        this.heartbeats = {}

        this.syncOrderbooks.on('message', this.updateHeartBeats.bind(this))
        this.syncOrderbooks.on('message', this.update.bind(this))
        this.syncOrderbooks.on('error', err => console.log(err))
        this.syncOrderbooks.on('close', () => {
            console.log('Socket connection closed.\nAttempting to reconnect...')
            this.initialized = false
            this.syncOrderbooks.connect()
        })        

        setInterval(() => {
            this.products.forEach(this.checkHeartBeats.bind(this))
        }, 1000 * 60 * 5);        
    }

    /**
     * Checks if orderbooks are not empty, if so it emits
     * and update event.
     */
    update(data) {
        if (this.initialized) {
            this.emit('update', this.syncOrderbooks.books, data)
        } else {
            for (let i = 0; i < this.products.length; i++) {
                const p = this.products[i]
    
                const bids = this.syncOrderbooks.books[p].state()['bids']
                const asks = this.syncOrderbooks.books[p].state()['asks']
    
                if (bids.length === 0 || asks.length === 0) { return }
            }
            this.initialized = true
        }
    }

    /**
     * Checks whether the heartbeat channel is still alive.
     * If last heatbeat was more than 15 seconds ago, it
     * gets logged to console.
     */
    checkHeartBeats(product_id) {
        const lastBeat = this.heartbeats[product_id]
        const now = new Date().getTime()
        const last = new Date(lastBeat).getTime()
        if (now - last > 1000 * 15) { console.log(`Heartbeat stopped for ${product_id}`) }
    }

    /**
     * Updates the heartbeats for each product.
     */
    updateHeartBeats(data) {
        if (data.type === 'heartbeat') {
            const { product_id, time } = data
            this.heartbeats[product_id] = time      
        }
    }
}

module.exports = OrderbookFeed