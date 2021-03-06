const Trade = require('../trade')
const uuidv4 = require('uuid/v4')

class ArbitrageUnit {
    constructor(id, steps, executor) {
        this.id = id
        this.create(steps)
        
        this.executor = executor
        if (this.executor.locks > 1) {
            this.executor.lock()
            this.executor.locks--
        }
    }

    /**
     * Creates trades out of steps.
     */
    create(steps) {
        this.trades = steps.reduce((acc, step) => {
            const { type: side, id: product_id, funds, size } = step
            const client_oid = uuidv4()

            const params = {
                client_oid,
                type: 'market',
                side,
                product_id
            }

            if (funds && size || !funds && !size) {
                throw new Error('something wrong with steps.')
            }
            if (funds) {
                params.funds = funds
            } else if (size) {
                params.size = size
            }             

            const trade = new Trade(params)
            acc.push(trade)
            return acc
        }, [])
    }

    /**
     * Function to check if all trades have been
     * executed succesfully.
     */
    done() {
        const res = this.trades.reduce((acc, trade) => trade.done() && acc, true)
        if (res) {
            if (this.executor.unlocks > 0) {
                this.executor.unlock()
                this.executor.unlocks--
            }
        }
        return res
    }

    /**
     * Function to check if any trade
     * has been canceled.
     */
    canceled() {
        return this.trades.reduce((acc, trade) => trade.canceled() || acc, false)
    }

}

module.exports = exports = ArbitrageUnit