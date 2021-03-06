const BigNumber = require('bignumber.js')

class Wallet {
    constructor(products, clientProvider) {
        this.products = products        
        
        this.getAccounts(clientProvider)

        setInterval(this.getAccounts.bind(this, clientProvider), 1000 * 60 * 5)
        
    }

    /**
     * Account: object with currency as key and account 
     * details like balance as data.
     * {
     *  id
     *  currency
     *  balance
     *  available
     *  hold
     *  profile_id
     * }
    */
    getAccounts(clientProvider) {
        clientProvider.getClient().getAccounts()
        .then(data => {
            this.accounts = data.reduce((acc, account) => {
                const { currency } = account
                this.products.forEach(product => {
                    if (product.split('-')[0] === currency || product.split('-')[1] === currency) {
                        if (!acc[currency]) {
                            account.balance = BigNumber(account.balance)
                            account.hold = BigNumber(account.hold)
                            account.available = BigNumber(account.available)

                            acc[currency] = Object.assign({}, account)
                        }
                    }
                })
                return acc
            }, {})
        })
    }

    /**
     * Updates the holds and therefore 
     * also the available field.
     * 
     * Should be called when trade gets executed.
     * Holds should be reset when trade is completed.
     */
    updateHolds(currency, hold) {
        this.accounts[currency].hold = this.accounts[currency].hold.plus(hold)
        if (this.accounts[currency].hold < 0) { this.accounts[currency].hold = BigNumber(0) }
        this.accounts[currency].available = this.accounts[currency].balance.minus(this.accounts[currency].hold)
    }

    /**
     * Updates balance and therefore available field.
     * 
     * Should be called when trade is completed.
     */
    updateBalance(currency, balance) {
        this.accounts[currency].balance = this.accounts[currency].balance.plus(balance)
        this.accounts[currency].available = this.accounts[currency].balance.minus(this.accounts[currency].hold)
    }
}

module.exports = exports = Wallet