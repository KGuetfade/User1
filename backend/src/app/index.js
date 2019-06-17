const OrderbookFeed = require('../orderbook-feed')
const ArbitrageCalculator = require('../arbitrage-calculator')
const Trader = require('../trader')
const DataCollector = require('../data-collector')

class App {
    constructor(products, dataMode, tradeMode) {
        this.dataMode = dataMode
        this.tradeMode = tradeMode
        this.products = products

        this.orderbookFeed = new OrderbookFeed(this.products)
        this.calculator = new ArbitrageCalculator()   
        
        if (this.dataMode) {
            console.log('App started in data-collecting mode')
            this.dataCollector = new DataCollector()
        } else if (this.tradeMode) { 
            console.log('App started in trade mode') 
            this.trader = new Trader(this.products, .75)
        }
        else { console.log('App started in idle mode') }
    }

    start() {
        this.orderbookFeed.on('update', this.run.bind(this))
    }

    run(orderbooks) {
        const result = this.calculator.calculate(this.products.map(product => ({ id: product, orderbook: orderbooks[product].state() })))                

        if (this.dataMode) { this.dataCollector.collect(result) }   
        else if (this.tradeMode) { this.trader.process(result) }     
        else { this.log(result, orderbooks) }
    }

    log(result, orderbooks) {
        console.log('--------------------------')
        console.log(`percentage: ${result.percentage}\n`)
        result.steps.forEach((step, index) => console.log(`Step ${index + 1} | type: ${step.type} | id: ${step.id} | ${step.type === 'buy' ? `funds: ${step.funds}` : `size: ${step.size}`} | ${step.type === 'buy' ? `${this.log_order(orderbooks[step.id].state()['asks'][0])}` : `${this.log_order(orderbooks[step.id].state()['bids'][0])}` }\n`))
    }

    log_order(order) {
        return ` price ${order.price.toString()} | size ${order.size.toString()}`
    }
}

module.exports = exports = App