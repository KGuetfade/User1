class Trade {
    constructor(params) {
        this.params = params
        this.stages = {
            requested: false,
            received: false,
            matched: false,
            done: false
        }
        this.order_id = ''
        this.match = ''
        this.reason = ''
    }

    /**
     * Check if trade is done.
     */
    done() {
        return this.stages.requested && this.stages.received &&
               this.stages.matched && this.stages.done && 
               this.reason === 'filled'
    }

    /**
     * Check if trade is canceled.
     */
    canceled() {
        return this.reason === 'canceled'
    }
}

module.exports = exports = Trade