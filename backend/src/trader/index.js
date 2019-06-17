const TradeFirewall = require('../trade-firewall')
const TradeExecutor = require('../trade-executor')
const TradeVerifier = require('../trade-verifier')

class Trader {
    constructor(products, calculator, fee) {
        this.products = products
        this.calculator = calculator
        this.fee = fee
        
        this.firewall = new TradeFirewall(this.products)
        this.executor = new TradeExecutor()
        this.verifier = new TradeVerifier()
    }

    /**
     * Takes in the orderbooks. Firewall checks data.
     * If it passes, executor executes trade. Finally,
     * verifier checks and persists the trade.
     */
    process(orderbooks) {
        const products = this.calculator.getInputFromOrderbooks(orderbooks)
        const { percentage, steps } = this.calculator.calculatePercentage(products)

        if (!this.firewall.checkPercentage(percentage)) { return }

        this.calculator.calculateSizes(products, steps)

        if (!this.firewall.checkSizes(steps)) { return }
        if (!this.firewall.checkLocked()) { return }

        this.executor.execute(result)
        this.verifier.verify()
    }
}

module.exports = exports = Trader