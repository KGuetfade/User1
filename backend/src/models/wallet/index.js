class Wallet {
    constructor(products, clientProvider) {
        this.products = products        
        
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
        clientProvider.getClient().getAccounts()
            .then(data => {
                this.accounts = data.reduce((acc, account) => {
                    const { currency } = account
                    this.products.forEach(product => {
                        if (product.split('-')[0] === currency || product.split('-')[1] === currency) {
                            if (!acc[currency]) {
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
        this.accounts[currency].hold += hold
        if (this.accounts[currency].hold < 0) { this.accounts[currency].hold = 0 }
        this.accounts[currency].available = this.accounts[currency].balance - this.accounts[currency].hold
    }

    /**
     * Updates balance and therefore available field.
     * 
     * Should be called when trade is completed.
     */
    updateBalance(currency, balance) {
        this.accounts[currency].balance += balance
        this.accounts[currency].available = this.accounts[currency].balance - this.accounts[currency].hold
    }
}

module.exports = exports = Wallet