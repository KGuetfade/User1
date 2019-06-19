class TradeTracker {
    constructor(verifier, feed) {
        this.units = []
        this.verifier = verifier
        feed.on('message', this.process.bind(this))
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
                unit.process(data)

                if (unit.done()) {
                    this.handleDone(unit)
                } else if (unit.canceled()) {
                    throw new Error('trade got canceled')
                }
            })
        }
    }

    /**
     * Removes a unit which is done from units array.
     * Emits verify event for trade verifier.
     */
    handleDone(unit) {
        this.units = this.units.filter(u => u.id != unit.id)
        this.verifier.emit('verify', unit)
    }
}

module.exports = exports = TradeTracker