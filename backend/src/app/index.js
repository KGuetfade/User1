const OrderbookFeed = require('../orderbook-feed')
const ArbitrageCalculator = require('../arbitrage-calculator')
const DataCollector = require('../data-collector')

class App {
    constructor(products, dataMode, tradeMode) {
        this.dataMode = dataMode
        this.tradeMode = tradeMode
        this.products = products

        this.orderbookFeed = new OrderbookFeed(this.products)
        this.calculator = new ArbitrageCalculator(this.products)   
        
        if (this.dataMode) {
            console.log('App started in data-collecting mode')
            this.dataCollector = new DataCollector()
        } else if (this.tradeMode) { console.log('App started in trade mode') }
        else { console.log('App started in idle mode') }
    }

    start() {
        this.orderbookFeed.on('update', this.process.bind(this))
    }

    process(orderbooks) {
        this.calculator.update(
            this.products.map((product, index) => ({
                id: product, 
                orderbook: orderbooks[this.products[index]].state()
            }))
        )

        const result = this.calculator.calculatePercentage()                
        this.calculator.calculateSizes(result.steps) 

        if (this.dataMode) { this.dataCollector.collect(result) }        
    }

    log(result) {
        console.log('--------------------------')
        console.log(`percentage: ${result.percentage}`)
        result.steps.forEach((step, index) => console.log(`Step ${index + 1} | type: ${step.type} | id: ${step.id} | ${step.type === 'buy' ? `funds: ${step.funds}` : `size: ${step.size}`}\n`))
    }
}

module.exports = exports = App