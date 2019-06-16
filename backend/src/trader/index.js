const TradeFirewall = require('../trade-firewall')
const TradeExecutor = require('../trade-executor')
const TradeVerifier = require('../trade-verifier')

class Trader {
    constructor(products, fee) {
        this.firewall = new TradeFirewall()
        this.executor = new TradeExecutor()
        this.verifier = new TradeVerifier()
    }

    /**
     * Processes the incoming trade.
     * Puts it through firewall, executes
     * the trade and then analyzes and persists
     * trade data. 
     */
    process(trade) {

    }
}

module.exports = exports = Trader