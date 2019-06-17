const TradeFirewall = require('../trade-firewall')
const TradeExecutor = require('../trade-executor')
const TradeVerifier = require('../trade-verifier')

class Trader {
    constructor(products, fee, calculator) {
        this.products = products
        this.fee = fee
        this.calculator = calculator
        this.firewall = new TradeFirewall()
        this.executor = new TradeExecutor()
        this.verifier = new TradeVerifier()
    }

    /**
     * Takes in the orderbooks. Calculates percentage,
     * if firewall rejects percentage, it returns. Else
     * if calculates sizes. Again if firewall rejects, it returns.
     * If executor is locked, return, else executor executes trade
     * and locks itself. When trade is done, verifier, checks if trade went
     * succesfully and persists data to database.
     */
    process(orderbooks) {

    }
}

module.exports = exports = Trader