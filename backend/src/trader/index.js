const TradeFirewall = require('../trade-firewall')
const TradeExecutor = require('../trade-executor')
const TradeVerifier = require('../trade-verifier')
const TradeTracker = require('../trade-tracker')
const AuthenticatedClientProvider = require('../authenticated-client-provider')
const Wallet = require('../models/wallet')
const ArbitrageUnit = require('../models/arbitrage-unit')
const uuidv4 = require('uuid/v4')

class Trader {
    constructor(products, calculator, fee, feed) {
        this.products = products
        this.calculator = calculator
        this.fee = fee
        
        this.clientProvider = new AuthenticatedClientProvider()
        this.wallet = new Wallet(this.products, this.clientProvider)

        this.firewall = new TradeFirewall(this.products, this.clientProvider)
        this.executor = new TradeExecutor(this.clientProvider)
        this.verifier = new TradeVerifier(this.wallet)
        this.tracker = new TradeTracker(this.verifier, feed)
    }

    /**
     * Takes in the orderbooks. Firewall checks data.
     * If it passes, executor executes trade. Finally,
     * verifier checks and persists the trade.
     */
    process(orderbooks) {
        const products = this.calculator.getInputFromOrderbooks(orderbooks)
        const { percentage, steps } = this.calculator.calculatePercentage(products)

        if (!this.firewall.checkPercentage(percentage, this.fee)) { return }

        this.calculator.calculateSizes(products, steps)
        if (!this.firewall.checkSizes(steps, this.wallet)) { return }
        if (!this.firewall.checkClient()) { return }
        if (!this.firewall.checkUnlocked(this.executor.state)) { return }

        const id = uuidv4()
        const unit = new ArbitrageUnit(id, steps, {
            locks: 1,
            unlocks: 1,
            lock: this.executor.lock.bind(this.executor),
            unlock: this.executor.unlock.bind(this.executor)
        })
        
        this.executor.execute(unit)
        this.tracker.track(unit)
    }
}

module.exports = exports = Trader