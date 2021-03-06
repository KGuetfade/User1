const BigNumber = require('bignumber.js')
const CoinbasePro = require('coinbase-pro')

class TradeFirewall {
    constructor(products, clientProvider) {
        this.products = products        

        /**
         * Bases: object with currency pair as key and
         * general information on pair as data.
         */
        clientProvider.getClient().getProducts()
            .then(data => {
                this.bases = data.reduce((acc, product) => {
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
    checkSizes(steps, wallet, calculator, products) {
        if (!steps[0].funds && !steps[0].size) { return false }
        if (!this.checkSizeLimits(steps)) { return false }
        if (!this.checkBalances(steps, wallet, calculator, products)) { return false }
        
        return true
    }

    /**
     * Checks whether executor is unlocked.
     */
    checkUnlocked(state) {
        const { status } = state

        if (status === 'locked') { return false }
        else if (status === 'unlocked') { return true }
        else { throw new Error('something wrong with checkunlocked') }
    }

    /**
     * Checks if client has enough
     * remaining requests to execute 
     * trades.
     */
    checkClient(client) {
        const remaining = client.getRemainingRequests()
        if (remaining >= 3) { return true }
        return false
    }

    /**
     * Takes in steps and checks if account for each currency has 
     * enough balance to execute trade. Adjusts funds and sizes
     * if initial amounts exceed balances.
     */
    checkBalances(steps, wallet, calculator, products) {
        if (!wallet.accounts) { return false }

        for (let i = 0; i < 3; i++) {
            const { id, funds, size } = steps[i]

            if (funds) {
                const currency = id.split('-')[1]
                const { available } = wallet.accounts[currency]
                if (funds.isGreaterThanOrEqualTo(available)) { 
                    steps[i].funds = available.times(.8)    
                    calculator.adjustSizes(products, steps, i)
                    return true
                }

            } else if (size) {
                const currency = id.split('-')[0]
                const { available } = wallet.accounts[currency]
                if (size.isGreaterThanOrEqualTo(available)) { 
                    steps[i].size = available.times(.8)    
                    calculator.adjustSizes(products, steps, i)
                    return true
                 }

            } else {
                throw new Error('something wrong with steps')
            }
        }

        return true
    }

    /**
     * Takes in steps and checks if trade
     * sizes and funds are large enough to
     * execute trades.
     */
    checkSizeLimits(steps) {
        if (!this.bases) { return false }

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
                throw new Error('something wrong with steps')
            }
        }
        return true
    }
}

module.exports = exports = TradeFirewall