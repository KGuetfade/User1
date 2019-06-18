const CoinbasePro = require('coinbase-pro')
const config = require('../../configuration')

const key = config.get('COINBASE_PRO_API_KEY')
const secret = config.get('COINBASE_PRO_API_SECRET')
const passphrase = config.get('COINBASE_PRO_API_PASSPHRASE')
const apiURI = config.get('COINBASE_PRO_API_URL')

class Wallet {
    constructor(products) {
        this.products = products        
        
        /**
         * Account: object with currency as key and account 
         * details like balance as data.
         */
        const authClient = new CoinbasePro.AuthenticatedClient(key, secret, passphrase, apiURI)
        authClient.getAccounts()
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