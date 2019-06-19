

class Wallet {
    constructor(products, clientProvider) {
        this.products = products        
        
        /**
         * Account: object with currency as key and account 
         * details like balance as data.
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
}

module.exports = exports = Wallet