const BigNumber = require('bignumber.js')

/**
 * Class for calculating arbitrage values.
 * Takes in array of products containing and id and an orderbook.
 * Takes in buy and sell method for handling buying and selling on an orderbook.
 */
class ArbitrageCalculator {
    constructor({ products }) {
        this.products = products
    }

    update({ products }) {
        this.products = products
    }

    buy(book, amountYouHave) {
        const asks = book['asks']
        const topAsk = asks[0]
        const price = topAsk.price
        return BigNumber(amountYouHave).dividedBy(price)
    }

    sell(book, amountYouHave) {
        const bids = book['bids']
        const topBid = bids[0]
        const price = topBid.price
        return BigNumber(amountYouHave).times(price)
    }

    maxBuy(book) {
        const asks = book['asks']
        const topAsk = asks[0]
        const price = topAsk.price
        const size = topAsk.size
        return BigNumber(price).times(size)
    }

    maxSell(book) {
        const bids = book['bids']
        const topBid = bids[0]
        const size = topBid.size
        return BigNumber(size)
    }

    checkCycle({ steps, startIndex }) {
        let next = steps[startIndex].type === 'buy' ? steps[startIndex].funds : steps[startIndex].size
        for (let i = 0; i < 3; i++) {
            const index = (i + startIndex) % 3
            const step = steps[index]
            const { orderbook } = this.products[step.index]
            if (step.type === 'buy') {                
                const { funds } = step
                if (next.isGreaterThan(funds)) { return false }
                next = this.buy(orderbook, next)
            } else {
                const { size } = step
                if (next.isGreaterThan(size)) { return false }
                next = this.sell(orderbook, next)
            }
        }
        return true
    }

    adjustSizes({ steps, startIndex }) {
        let next = steps[startIndex].type === 'buy' ? steps[startIndex].funds : steps[startIndex].size
        next = BigNumber(next)
        for (let i = 0; i < 3; i++) {
            const index = (i + startIndex) % 3
            const step = steps[index]
            const { orderbook } = this.products[step.index]
            if (step.type === 'buy') {                
                step.funds = next
                next = this.buy(orderbook, next)
            } else {
                step.size = next
                next = this.sell(orderbook, next)
            }
        }
    }

    /**
     * Function to calculate max arbitrage profit percentage.
     * Returns max percentage and steps to follow.
     */
    calculatePercentage() {
        const { id: id1 } = this.products[0]
        const { id: id2 } = this.products[1]
        const { id: id3 } = this.products[2]
        const ids = [id1, id2, id3]

        const buySteps = this.calculateSteps({ ids, type: 'buy' })
        const sellSteps = this.calculateSteps({ ids, type: 'sell' })

        const buyResult = buySteps.reduce((acc, step) => {
            const { orderbook } = this.products[step.index]
            if (step.type === 'buy') { return this.buy(orderbook, acc) }
            else { return this.sell(orderbook, acc) }
        }, BigNumber(1))

        const sellResult = sellSteps.reduce((acc, step) => {
            const { orderbook } = this.products[step.index]
            if (step.type === 'buy') { return this.buy(orderbook, acc) }
            else { return this.sell(orderbook, acc) }
        }, BigNumber(1))

        const percentage = BigNumber(Math.max(buyResult, sellResult)).minus(1).times(100)
        const steps = buyResult >= sellResult ? buySteps : sellSteps

        return {
            percentage, 
            steps
        }
    }

    /**
     * Function to calculate size of each order.
     * Takes in steps to trade on.
     * Returns steps with sizes / funds to execute trade.
     */
    calculateSizes({ steps }) {
        steps.forEach(step => {
            if (step.type === 'buy') {
                step.funds = this.maxBuy(this.products[step.index].orderbook)
            } else {
                step.size = this.maxSell(this.products[step.index].orderbook)
            }
        })
        
        const useFirst = this.checkCycle({ steps, startIndex: 0 })
        const useSecond = this.checkCycle({ steps, startIndex: 1 })
        const useThird = this.checkCycle({ steps, startIndex: 2 })

        if  (useFirst && useSecond || useFirst && useThird || useSecond && useThird || !(useFirst || useSecond || useThird)) {
            throw new Error('Something wrong with size calculation!')
        }

        const startIndex = useFirst ? 0 : useSecond ? 1 : 2

        this.adjustSizes({ steps, startIndex })
    }

    /**
     * Function to calculate arbitrage steps.
     * Takes in three product id's and first transaction type (buy / sell)
     * Returns array with 3 objects representing the steps. 
     * Each object has a type (buy / sell), an index (id to transact on) and the id itself
     */
    calculateSteps({ ids, type }) {
        const steps = []
        const id1 = ids[0]
        const id2 = ids[1]
        const id3 = ids[2]

        if (type === 'buy') {
            steps.push({ type: 'buy', index:0, id: id1 })
            const c1 = id1.split('-')[0]

            if (id2.includes(c1)) {
                if (id2.split('-')[0] === c1) {
                    steps.push({ type: 'sell', index:1, id: id2 })
                    var c2 = id2.split('-')[1]
                } else {
                    steps.push({ type: 'buy', index:1, id: id2 })
                    var c2 = id2.split('-')[0]
                }

                if (id3.includes(c2)) {
                    if (id3.split('-')[0] === c2) {
                        steps.push({ type: 'sell', index:2, id: id3 })
                    } else {
                        steps.push({ type: 'buy', index:2, id: id3 })
                    }
                } else { throw new Error("please provide correct arbitrage pairs") }

            } else if (id3.includes(c1)) {

                if (id3.split('-')[0] === c1) {
                    steps.push({ type: 'sell', index:2, id: id3 })
                    var c3 = id3.split('-')[1]
                } else {
                    steps.push({ type: 'buy', index:2, id: id3 })
                    var c3 = id3.split('-')[0]
                }

                if (id2.includes(c3)) {  
                    if (id2.split('-')[0] === c3) {
                        steps.push({ type: 'sell', index:1, id: id2 })                        
                    } else {
                        steps.push({ type: 'buy', index:1, id: id2 })
                    }                  
                } else { throw new Error("please provide correct arbitrage pairs") }

            } else { throw new Error("please provide correct arbitrage pairs") }

        } else if (type === 'sell') {
            steps.push({ type: 'sell', index:0, id: id1 })
            const c1 = id1.split('-')[1]

            if (id2.includes(c1)) {
                if (id2.split('-')[0] === c1) {
                    steps.push({ type: 'sell', index:1, id: id2 })
                    var c2 = id2.split('-')[1]
                } else {
                    steps.push({ type: 'buy', index:1, id: id2 })
                    var c2 = id2.split('-')[0]
                }

                if (id3.includes(c2)) {
                    if (id3.split('-')[0] === c2) {
                        steps.push({ type: 'sell', index:2, id: id3 })
                    } else {
                        steps.push({ type: 'buy', index:2, id: id3 })
                    }
                } else { throw new Error("please provide correct arbitrage pairs") }

            } else if (id3.includes(c1)) {

                if (id3.split('-')[0] === c1) {
                    steps.push({ type: 'sell', index:2, id: id3 })
                    var c3 = id3.split('-')[1]
                } else {
                    steps.push({ type: 'buy', index:2, id: id3 })
                    var c3 = id3.split('-')[0]
                }

                if (id2.includes(c3)) {  
                    if (id2.split('-')[0] === c3) {
                        steps.push({ type: 'sell', index:1, id: id2 })                        
                    } else {
                        steps.push({ type: 'buy', index:1, id: id2 })
                    }                  
                } else { throw new Error("please provide correct arbitrage pairs") }

            } else { throw new Error("please provide correct arbitrage pairs") }

        } else { throw new Error("please provide correct type") }

        return steps
    }
}

module.exports = ArbitrageCalculator