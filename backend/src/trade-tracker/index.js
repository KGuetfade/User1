class TradeTracker {
    constructor(verifier) {
        this.units = []
        this.verifier = verifier
    }

    /**
     * Adds an arbitrage unit to get tracked.
     */
    track (unit) {
        this.units.push(unit)
    }

    /**
     * Loops over all arbitrage units
     * and processes streaming data.
     */
    process(data) {
        if (this.units.length === 0) { return } 
        else {
            this.units.forEach((unit) => {
                this.processUnit(unit, data)
            })
        }
    }

    /**
     * Function to process unit. 
     * First processes each trade.
     * Then checks state of unit.
     */
    processUnit(unit, data) {
        unit.trades.forEach(trade => this.processTrade(trade, data))

        if (unit.done()) {
            this.handleDone(unit)
        } else if (unit.canceled()) {
            throw new Error('trade got canceled')
        }
    }

    /**
     * Function to handle a unit
     * whose trades have all been
     * completed succesfully
     */
    handleDone(unit) {
        console.log(`trade executed succesfully for ${unit.id}`)
        this.units = this.units.filter(u => u.id != unit.id)
        this.verifier.emit('verify', unit)
    }

    /**
     * Function to process trade.
     * Goes through each stage and checks
     * if trade can go to next stage.
     */
    processTrade(trade, data) {
        const { 
            requested, 
            received, 
            matched, 
            done 
        } = trade.stages

        const { product_id, client_oid } = trade.params

        if (!requested) {
            return
        }

        else if (!received) {
            if (data.type === 'received') {
                if (data.product_id === product_id) {
                    if (data.client_oid === client_oid) {
                        trade.stages.received = true
                        trade.order_id = data.order_id
                    }
                }
            }
        }

        else if (!matched || !done) {
            if (!matched && data.type === 'match') {
                if (data.product_id === product_id) {
                    if (data.taker_order_id === trade.order_id) {
                        trade.stages.matched = true
                        trade.match = data
                    }
                }
            }

            if (data.type === 'done') {
                if (data.product_id === product_id) {
                    if (data.order_id === trade.order_id) {
                        trade.stages.done = true
                        trade.reason = data.reason
                    }
                }
            }
        }
    }
}

module.exports = exports = TradeTracker