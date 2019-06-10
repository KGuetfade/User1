const OrderbookFeed = require('../orderbook-feed')
const ArbitrageCalculator = require('../arbitrage-calculator')

const coinbaseModel = require('../models/coinbasepro')

class Trader {
    constructor({ products }) {
        this.products = products
        this.calculator = new ArbitrageCalculator({ products: this.products })
    }

    start() {
        const onMessage = orderbooks => {
            if (this.orderbooksNotEmpty(orderbooks)) {
                this.calculator.update({
                    products: this.products.map((p, i) => ({
                        id: p, 
                        orderbook: orderbooks.books[this.products[i]].state()
                    }))
                })

                const result = this.calculator.calculatePercentage()                
                this.calculator.calculateSizes({ steps: result.steps })   
                /* this.saveToDatabase(result)   */          
            }
        }

        this.feed = new OrderbookFeed({ products: this.products, onMessage })
        this.feed.start()
    }

    stop() {
        this.feed.stop()
        this.feed = null
    }

    orderbooksNotEmpty(orderbooks) {
        const b1 = orderbooks.books[this.products[0]].state()
        const b2 = orderbooks.books[this.products[1]].state()
        const b3 = orderbooks.books[this.products[2]].state() 
    
        if (b1['asks'].length > 0 && b1['bids'].length > 0) {
            if (b2['asks'].length > 0 && b2['bids'].length > 0) {
                if (b3['asks'].length > 0 && b3['bids'].length > 0) {
                    return true
                }
            }
        }
    
        return false
    }

    saveToDatabase(result) {
        if (!this.lastPercentage) { 
            this.lastPercentage = result.percentage
            this.startTime = new Date()
            this.currentPercentage = this.lastPercentage
            return
        }

        this.currentPercentage = result.percentage

        if (!this.currentPercentage.isEqualTo(this.lastPercentage)) {
            const endTime = new Date()
            const duration = endTime.getTime() - this.startTime.getTime()            
            coinbaseModel.create({
                steps: result.steps,
                percentage: this.lastPercentage,
                time: this.startTime,
                duration
            })
            .catch(err => console.log(err))
            this.startTime = new Date()
        }

        this.lastPercentage = this.currentPercentage
    }
}

module.exports = Trader