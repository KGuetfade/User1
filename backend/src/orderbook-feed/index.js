const CoinbasePro = require('coinbase-pro')

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
}

module.exports = OrderbookFeed