const WebsocketClient = require('coinbase-pro').WebsocketClient
const config = require('../configuration')

const key = config.get('COINBASE_PRO_API_KEY')
const secret = config.get('COINBASE_PRO_API_SECRET')
const passphrase = config.get('COINBASE_PRO_API_PASSPHRASE')
const apiURI = config.get('COINBASE_PRO_API_URL')
const websocketURI = config.get('COINBASE_PRO_WS_UR;')

class TradeVerifier extends WebsocketClient {
    constructor(
        productIDs,
        websocketURI = websocketURI,
        auth = null
      ) {
        super(productIDs, websocketURI, auth)

        this.state = { 
            mode: 'idle',
            trades: []
        }

        this.on('message', this.process.bind(this))
        this.on('verify', this.triggerVerifyMode.bind(this))
        this.on('done', this.finalize.bind(this))
      }

      /**
       * Processes streaming data.
       */
    process(data) {
        const { mode } = this.state
        
        if (mode === 'idle') { return }

        if (mode === 'verify') {
            const { trades } = this.state

            trades.forEach(trade => {
                trade.updateStage(data)
            })

            if (this.checkCanceled()) { throw new Error('trade got canceled.') }
            if (this.checkDone()) { this.emit('done') }
        }
    }

    /**
     * Checks if all trades executed succesfully.
     */
    checkDone() {
        return this.trades.reduce((acc, trade) => acc && trade.done(), true)
    }

    /**
     * Checks if any trade was canceled.
     */
    checkCanceled() {
        return this.trades.reduce((acc, trade) => acc || trade.canceled(), false)
    }

    /**
     * Sets internal state to
     * verification mode.
     * Locks executor.
     */
    triggerVerifyMode(trades) {
        this.state = Object.assign({}, this.state, {
            mode: 'verify',
            trades
        })
    }

    /**
     * Sets internal state to 
     * idle mode.
     */
    triggerIdleMode() {
        this.state = Object.assign({}, this.state, {
            mode: 'idle',
            trades: []
        })
    }

    /**
     * Process final trade data
     * and persists it to database.
     * Unlocks executor.
     */
    finalize() {


        this.triggerIdleMode()
    }
 }

module.exports = exports = TradeVerifier