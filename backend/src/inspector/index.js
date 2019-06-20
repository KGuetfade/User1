const BigNumber = require('bignumber.js')

class Inspector {
    constructor(wallet) {
        this.wallet = wallet

        setTimeout(() => {
            if (!this.wallet.accounts) { throw new Error('wallet did not initialize') }
            this.initialstate = this.wallet.accounts
        }, 1000 * 10)
        setInterval(this.log.bind(this), 1000 * 60 * 5)
    }

    /**
     * Function which throws error
     * when current balance is less then 90%
     * of initial starting balance
     */
    stopLoss() {
        if (!this.initialstate) { return }
        Object.keys(this.wallet.accounts).forEach(currency => {
            const stop = BigNumber(this.initialstate[currency].balance).times(0.9)
            if (stop.isGreaterThan(this.wallet.accounts[currency].balance)) {
                throw new Error('Application postphoned indefinetly. You lost more than 10% of your money u stupid nigga')
            }
        })
    }

    /**
     * Logs relevant data.
     */
    log() {
        console.log('=======================')
        console.log(`Update at ${new Date()}\n`)
        console.log('--initial state--')
        this.logInitial()
        console.log('--current state--')
        this.logCurrent()
        console.log('--delta--')
        this.logDelta()
        console.log('')

    }

    /**
     * Logs profit per wallet
     * since starting of application.
     */
    logDelta() {
        Object.keys(this.wallet.accounts).forEach(currency => {
            const net = this.wallet.accounts[currency].balance - this.initialstate[currency].balance
            console.log(`Net profit for ${currency}: ${net}`)
        })
    }

    /**
     * Logs current wallet data
     */
    logCurrent() {
        Object.keys(this.wallet.accounts).forEach(currency => {
            const balance = this.wallet.accounts[currency].balance
            console.log(`Current balance for ${currency}: ${balance}`)
        })
    }

    /**
     * Logs initial state
     */
    logInitial() {
        Object.keys(this.wallet.accounts).forEach(currency => {
            const balance = this.initialstate[currency].balance
            console.log(`Initial balance for ${currency}: ${balance}`)
        })
    }
}

module.exports = exports = Inspector