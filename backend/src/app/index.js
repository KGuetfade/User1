const { Coinbase, Binance } = require('../socket-feed')
const Trader = require('../trader')

class App {
    constructor() {

    }

    start() {
        /* const coinbase = new Coinbase(['BTC-EUR'])
        coinbase.connect()
        coinbase.on('message', message => {
            console.log(message)
        }) */
        const trader = new Trader({products:['BTC-EUR', 'ETH-EUR', 'ETH-BTC']})
        trader.start()
        /* const binance = new Binance('BNBBTC')
        binance.connect()
        binance.on('message', message => {
            console.log(message)
        }) */
    }
}

module.exports = exports = App