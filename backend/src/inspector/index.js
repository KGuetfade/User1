class Inspector {
    constructor(wallet, loss) {
        this.wallet = wallet
        this.loss = loss

        setTimeout(() => {
            if (!this.wallet.accounts) { throw new Error('wallet did not initialize') }
            this.initialstate = this.wallet.accounts
            console.log('\n--initial state--')
            this.logInitial()
        }, 1000 * 10)
        setInterval(this.log.bind(this), 1000 * 60 * 10)
    }

    /**
     * Function which throws error
     * when current balance is less then 90%
     * of initial starting balance
     */
    stopLoss() {
        if (!this.initialstate) { return }
        Object.keys(this.wallet.accounts).forEach(currency => {
            const stop = this.initialstate[currency].balance.times(this.loss)
            if (this.wallet.accounts[currency].balance.isLessThan(stop)) {
                throw new Error('Application postphoned indefinitely. You lost more than 10% of your money u stupid nigga')
            }
        })
    }

    /**
     * Logs relevant data.
     */
    log() {
        console.log(`\n${new Date()} - Status update\n`)
        console.log('--initial state--')
        this.logInitial()
        console.log('\n--current state--')
        this.logCurrent()
        console.log('\n--delta--')
        this.logDelta()

    }

    /**
     * Logs profit per wallet
     * since starting of application.
     */
    logDelta() {
        Object.keys(this.wallet.accounts).forEach(currency => {
            const net = this.wallet.accounts[currency].balance.minus(this.initialstate[currency].balance)
            console.log(`Net profit for ${currency}: ${net.toFixed(6)}`)
        })
    }

    /**
     * Logs current wallet data
     */
    logCurrent() {
        Object.keys(this.wallet.accounts).forEach(currency => {
            const balance = this.wallet.accounts[currency].balance
            console.log(`Current balance for ${currency}: ${balance.toFixed(6)}`)
        })
    }

    /**
     * Logs initial state
     */
    logInitial() {
        Object.keys(this.wallet.accounts).forEach(currency => {
            const balance = this.initialstate[currency].balance
            console.log(`Initial balance for ${currency}: ${balance.toFixed(6)}`)
        })
    }
}

module.exports = exports = Inspector