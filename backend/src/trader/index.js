const TradeFirewall = require('../trade-firewall')
const TradeExecutor = require('../trade-executor')
const TradeVerifier = require('../trade-verifier')
const TradeTracker = require('../trade-tracker')
const Inspector = require('../inspector')
const AuthenticatedClientProvider = require('../authenticated-client-provider')
const Wallet = require('../models/wallet')
const ArbitrageUnit = require('../models/arbitrage-unit')
const uuidv4 = require('uuid/v4')

class Trader {
    constructor(products, calculator, fee, loss) {
        this.products = products
        this.calculator = calculator
        this.fee = fee
        this.loss = loss
        
        this.clientProvider = new AuthenticatedClientProvider()
        this.wallet = new Wallet(this.products, this.clientProvider)
        this.inspector = new Inspector(this.wallet, this.loss)

        this.firewall = new TradeFirewall(this.products, this.clientProvider)
        this.executor = new TradeExecutor(this.clientProvider)
        this.verifier = new TradeVerifier(this.wallet)
        this.tracker = new TradeTracker(this.verifier)
    }

    /**
     * Takes in the orderbooks. Firewall checks data.
     * If it passes, executor executes trade. Finally,
     * verifier checks and persists the trade.
     */
    process(orderbooks, data) {
        this.inspector.stopLoss()
        this.tracker.process(data)

        const products = this.calculator.getInputFromOrderbooks(orderbooks)
        const { percentage, steps } = this.calculator.calculatePercentage(products)

        this.inspector.trackPercentage(percentage)

        if (!this.firewall.checkPercentage(percentage, this.fee)) { return }

        this.calculator.calculateSizes(products, steps)

        if (!this.firewall.checkSizes(steps, this.wallet, this.calculator, products)) { return }
        
        if (!this.firewall.checkClient(this.clientProvider)) { return }
        
        if (!this.firewall.checkUnlocked(this.executor.state)) { return }
        
        console.log(`found opportunity at ${percentage} %`)

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