const CoinbasePro = require('coinbase-pro')
const uuidv4 = require('uuid/v4')
const Trade = require('../models/trade')
const config = require('../configuration')

const key = config.get('COINBASE_PRO_API_KEY')
const secret = config.get('COINBASE_PRO_API_SECRET')
const passphrase = config.get('COINBASE_PRO_API_PASSPHRASE')
const apiURI = config.get('COINBASE_PRO_API_URL')

class TradeExecutor {
    constructor() {
        this.authClient = new CoinbasePro.AuthenticatedClient(key, secret, passphrase, apiURI)
        this.state = { status: 'unlocked' }
    }

    /**
     * Takes in steps and returns three trade objects.
     */
    createTrades(steps) {
        return steps.reduce((acc, step) => {
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
                this.authClient.placeOrder(params)
                    .catch(err => console.log(err))
            } else if (size) {
                params.size = size
                this.authClient.placeOrder(params)
                    .catch(err => console.log(err))
            }             

            const trade = new Trade(params)
            acc.push(trade)
            return acc
        }, [])
    }

    /**
     * Executes the trades.
     */
    execute(trades) {
        trades.forEach(trade => {
            trade.stages.requested = true
            this.authClient.placeOrder(trade.params)
                .catch(err => console.log(err))            
        })
    }

    /**
     * Locks the trade executor
     */
    lock() {
        this.state = Object.assign({}, this.state, { status: 'locked' })
    }

    /**
     * Unlocks the trade executor
     */
    unlock() {
        this.state = Object.assign({}, this.state, { status: 'unlocked' })
    }
}

module.exports = exports = TradeExecutor