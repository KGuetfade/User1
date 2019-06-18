const TradeFirewall = require('../trade-firewall')
const TradeExecutor = require('../trade-executor')
const TradeVerifier = require('../trade-verifier')
const Wallet = require('../models/wallet')
const config = require('../configuration')

const key = config.get('COINBASE_PRO_API_KEY')
const secret = config.get('COINBASE_PRO_API_SECRET')
const passphrase = config.get('COINBASE_PRO_API_PASSPHRASE')

const auth = { key, secret, passphrase }

class Trader {
    constructor(products, calculator, fee) {
        this.products = products
        this.calculator = calculator
        this.fee = fee
        
        this.firewall = new TradeFirewall(this.products)
        this.executor = new TradeExecutor()
        this.verifier = new TradeVerifier(this.products, auth=auth)
        this.wallet = new Wallet(this.products)
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
        if (!this.firewall.checkUnlocked(this.executor.state)) { return }

        this.executor.lock()
        const trades = this.executor.createTrades(steps)
        this.verifier.emit('verify', trades)
        this.executor.execute(trades)
    }
}

module.exports = exports = Trader