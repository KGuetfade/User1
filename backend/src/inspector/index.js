class Inspector {
    constructor(wallet) {
        this.wallet = wallet
        setInterval(this.log(), 1000 * 60 * 5)
    }

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

    logDelta() {
        Object.keys(this.wallet.accounts).forEach(currency => {
            const net = this.wallet.accounts[currency].balance - this.initialstate[currency].balance
            console.log(`Net profit for ${currency}: ${net}`)
        })
    }

    logCurrent() {
        Object.keys(this.wallet.accounts).forEach(currency => {
            const balance = this.wallet.accounts[currency].balance
            console.log(`Current balance for ${currency}: ${balance}`)
        })
    }

    logInitial() {
        Object.keys(this.wallet.accounts).forEach(currency => {
            const balance = this.initialstate[currency].balance
            console.log(`Initial balance for ${currency}: ${balance}`)
        })
    }
}

module.exports = exports = Inspector