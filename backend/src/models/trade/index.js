class Trade {
    constructor(params) {
        this.params = params
        this.stages = {
            requested: false,
            received: false,
            matched: false,
            done: false
        }
    }

    /**
     * Takes in stream data.
     * Checks current stage and then processes data.
     */
    updateStage(data) {
        const { 
            requested, 
            received, 
            matched, 
            done 
        } = this.stages

        const { product_id, client_oid } = this.params

        if (!requested) {
            return
        }

        else if (!received) {
            if (data.type === 'received') {
                if (data.product_id === product_id) {
                    if (data.client_oid === client_oid) {
                        this.stages.received = true
                        this.order_id = data.order_id
                    }
                }
            }
        }

        else if (!matched || !done) {
            if (!matched && data.type === 'match') {
                if (data.product_id === product_id) {
                    if (data.taker_order_id === this.order_id) {
                        this.stages.matched = true
                        this.match = data
                    }
                }
            }

            if (data.type === 'done') {
                if (data.product_id === product_id) {
                    if (data.order_id === this.order_id) {
                        this.stages.done = true
                        this.reason = data.reason
                    }
                }
            }
        }
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