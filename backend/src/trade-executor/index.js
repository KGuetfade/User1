class TradeExecutor {
    constructor(clientProvider) {
        this.clientProvider = clientProvider
        this.state = { status: 'unlocked' }
    }

    /**
     * Executes the trades.
     */
    execute(unit) {
        console.log(`performing trade on unit ${unit.id}`)
        unit.trades.forEach(trade => {
            console.log(`\t* ${trade.params.side} ${trade.params.product_id} at ${trade.params.funds ? trade.params.funds : trade.params.size}`)
            trade.stages.requested = true
            this.clientProvider.getClient()
                               .placeOrder(trade.params)
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