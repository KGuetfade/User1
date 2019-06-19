const EventEmitter = require('./node_modules/events').EventEmitter

class TradeVerifier extends EventEmitter {
    constructor(wallet) {
        this.wallet = wallet
        this.on('verify', this.verify.bind(this))
    }

    /**
     * Calculates profits and saves to database.
     */
    verify(unit) {

    }
 }

module.exports = exports = TradeVerifier