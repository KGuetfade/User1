const BigNumber = require('bignumber.js')
const CoinbasePro = require('coinbase-pro')
const config = require('../configuration')

const key = config.get('COINBASE_PRO_API_KEY')
const secret = config.get('COINBASE_PRO_API_SECRET')
const passphrase = config.get('COINBASE_PRO_API_PASSPHRASE')
const apiURI = config.get('COINBASE_PRO_API_URL')

class TradeFirewall {
    constructor(products) {
        this.products = products
        this.authClient = new CoinbasePro.AuthenticatedClient(key, secret, passphrase, apiURI)

        /**
         * Creates two class fields. 
         * Account: object with currency as key and account 
         * details like balance as data.
         * 
         * Bases: object with currency pair as key and
         * general information on pair as data.
         */
        Promise.all([this.authClient.getAccounts(), this.authClient.getProducts()])
            .then(values => {
                this.accounts = values[0].reduce((acc, account) => {
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

                this.bases = values[1].reduce((acc, product) => {
                    if (this.products.includes(product.id)) {
                        acc[product.id] = product
                    }
                    return acc
                }, {})
            })
            .catch(err => console.log(err))
    }

    /**
     * Takes in current fee and percentage.
     * Returns true if percentage is bigger than
     * fee else false.
     */
    checkPercentage(percentage, fee) {
        return percentage.isGreaterThan(BigNumber(fee))
    }

    /**
     * Takes in steps.
     * Returns true if trade can be executed with size's and funds
     * in the steps, based on minimum trading sizes, wallet status
     * and whether steps have funds or sizes
     */
    checkSizes(steps) {
        if (!this.accounts && !this.bases) { return false }
        if (!steps[0].funds && !steps[0].size) { return false }
        if (!this.checkSizeLimits(steps)) { return false }
        if (!this.checkBalances(steps)) { return false }
        
        return true
    }

    /**
     * Checks whether executor can execute trade.
     */
    checkLocked() {
    }

    /**
     * Takes in steps and checks if account for each currency has 
     * enough balance to execute trade. 
     */
    checkBalances(steps) {
        if (steps[0].funds.isGreaterThan(100) || steps[0].size.times(8310).isGreaterThan(100)) {
            return false
        }
        return true
    }

    /**
     * Takes in steps and checks if trade
     * sizes and funds are large enough to
     * execute trades.
     */
    checkSizeLimits(steps) {
        for (let i = 0; i < 3; i++) {
            const { id, funds, size } = steps[i]
            const { 
                base_min_size, 
                base_max_size,
                min_market_funds,
                max_market_funds
            } = this.bases[id]

            if (funds) {
                if (funds.isLessThan(BigNumber(min_market_funds)) ||
                    funds.isGreaterThan(BigNumber(max_market_funds))) {
                        return false
                    }
            } else if (size) {
                if (size.isLessThan(BigNumber(base_min_size)) ||
                    size.isGreaterThan(BigNumber(base_max_size))) {
                        return false
                    }
            } else {
                throw new Error('something wrong with checkSizeLimits')
            }
        }
        return true
    }
}

module.exports = exports = TradeFirewall