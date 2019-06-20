const EventEmitter = require('./node_modules/events').EventEmitter
const BigNumber = require('bignumber.js')
const NetTrade = require('../models/net-trade')

class TradeVerifier extends EventEmitter {
    constructor(wallet) {
        this.wallet = wallet
        this.on('verify', this.verify.bind(this))
    }

    /**
     * Gets distinct currencies.
     * Calculates net profit.
     * Updates wallet balances.
     * Stores / logs net profits.
     */
    verify(unit) {
        const distincts = this.getDistinct(unit.trades)
        const net = distincts.reduce((acc, currency) => {
            acc[currency] = this.getNet(currency, unit.trades)
        }, {})

        distincts.forEach(currency => this.wallet.updateBalance(currency, net[currency]))
        NetTrade.create({
            net,
            time: new Date()
        })
        .catch(err => console.log(err))
    }

    /**
     * Gets the net profit for each currency.
     */
    getNet(currency, trades) {
        const involved = trades.filter(trade => trade.params.product_id.includes(currency))
        return involved.reduce((acc, trade) => {
            const { side, product_id } = trade.params
            const quote = product_id.split('-')[1]
            const base = product_id.split('-')[0]

            if (side === 'buy') {
                const { size, price } = trade.match

                if (currency === quote) {
                    const remove = BigNumber(size).times(price)
                    return acc.minus(remove)
                } else if (currency === base) {
                    return acc.plus(size)
                }

            } else if (side === 'sell') {
                const { size, funds, price } = trade.match
                
                if (currency === quote) {
                    const add = size ? BigNumber(size).times(price) : funds
                    return acc.minus(add)
                } else if (currency === base) {
                    return size ? acc.minus(size) : acc.minus(BigNumber(funds).dividedBy(price))
                }

            } else {
                throw new Error('something wrong with getnet.')
            }
        }, BigNumber(0))
    }

    /**
     * Goes through the trades.
     * Gets distinct currencies.
     */
    getDistinct(trades) {
        return trades.reduce((acc, trade) => {
            const { product_id } = trade.params
            const quote = product_id.split('-')[1]
            const base = product_id.split('-')[0]

            if (!acc.includes(quote)) { acc.push(quote) }
            if (!acc.includes(base)) { acc.push(base) }

            return acc
        }, [])
    }
 }

module.exports = exports = TradeVerifier