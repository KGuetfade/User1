class TradeFirewall {
    constructor(products, fee) {
        this.fee = fee
    }

    /**
     * Checks if trade is profitable.
     * Checks if percentage is high enough.
     * Checks if volume is high enough.
     */
    checkProfitability(trade) {
        if (trade.percentage < this.fee) { return false }
    }

    /**
     * Checks if trade executor can execute trade.
     * Checks if trade is not locked.
     */
    checkStatus() {

    }
}

module.exports = exports = TradeFirewall