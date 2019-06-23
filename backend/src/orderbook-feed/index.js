const CoinbasePro = require('coinbase-pro')
const EventEmitter = require('events')

class OrderbookFeed extends EventEmitter{
    constructor(products) {
        super()
        this.products = products
        this.syncOrderbooks = new CoinbasePro.OrderbookSync(products);    
        this.applySketchyPatch()

        this.synced = this.products.reduce((acc, product) => {
            acc[product] = false
            return acc
        }, {})

        this.syncOrderbooks.on('message', this.onMessage.bind(this))
        this.syncOrderbooks.on('sync', this.onSync.bind(this))
        this.syncOrderbooks.on('synced', this.onSynced.bind(this))
        
        this.syncOrderbooks.on('error', err => console.log(err))
        this.syncOrderbooks.on('close', () => {
            console.log('Socket connection closed.\nAttempting to reconnect...')
            this.syncOrderbooks.connect()
        })        

        /* setInterval(() => {
            console.log(`Average latency over 1 minute period - ${this.latency / this.count}`)
            this.latency = 0
            this.count = 0
        }, 1000 * 60) */
    }

    /**
     * Checks if orderbooks are not empty, if so it emits
     * and update event.
     */
    onMessage(data) {      
        //this.profilePerformance(data)  
        if (this.allSynced()) {
            this.emit('update', this.syncOrderbooks.books, data)
        } 
    }

    /**
     * Handle orderbook sync event.
     */
    onSync(product_id) {
        console.log(`${new Date()} - syncing ${product_id}`)
        this.synced[product_id] = false
    }

    /**
     * Handle orderbook synced event.
     */
    onSynced(product_id) {
        console.log(`${new Date()} - synced ${product_id}`)
        this.synced[product_id] = true
    }

    /**
     * Function which checks if all
     * products have been synced.
     */
    allSynced() {
        return this.products.reduce((acc, product) => acc && this.synced[product], true)
    }

    /**
     * Logs top bid and ask of orderbook
     */
    logTop() {
        console.log('')
        this.products.forEach(product => {
            const book = this.syncOrderbooks.books[product]
            const bid = book.state()['bids'][0]
            const ask = book.state()['asks'][0]
            if (bid !== undefined && ask !== undefined) {
                console.log(`${product}: bid: ${bid.price.toString()} ask: ${ask.price.toString()} || bid: ${book.getBestBid().price.toString()} ask: ${book.getBestAsk().price.toString()}`)
            }            
        })
    }

    /**
     * Profile network latency
     */
    profilePerformance(data) {
        if (!this.count) {
            this.count = 0
        }

        if (!this.latency) {
            this.latency = 0
        }

        const sent = new Date(data.time).getTime()
        const arrived = new Date().getTime()
        const latency = arrived - sent

        this.latency += latency
        this.count++
    }

    /**
     * Applies sketchy path from
     * github.
     * https://github.com/coinbase/coinbase-pro-node/issues/308
     */
    applySketchyPatch() {
        this.products.forEach(product => {
            const orderBook = this.syncOrderbooks.books[product]

            const oldOrderBookStateMethod = orderBook.state
            orderBook.state = function (book) {
                if (book) {
                    this._asks.clear()
                    this._bids.clear()
                    this._ordersByID = {}
                }
                return oldOrderBookStateMethod.call(this, book)
            }

            orderBook.getBestBid = function() {
                return this._bids.max().orders
            }

            orderBook.getBestAsk = function() {
                return this._asks.min().orders
            }
        })        
    }    
}

module.exports = OrderbookFeed