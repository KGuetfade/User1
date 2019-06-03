const CoinbasePro = require('coinbase-pro')
const util = require('util')
const Decimal = require('decimal.js')

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

class CoinbaseProSimpleTriArb {
    constructor() {
        this.client = new CoinbasePro.PublicClient(); 
    }

    print(obj) {
        console.log(util.inspect(obj, {showHidden: false, depth: null}))
    }

    async start() {
        try {
            const market_pairs = await this.client.getProducts()
            const filtered_pairs = market_pairs.filter(pair => {
                if (pair.quote_currency === 'USD') { return false }
                if (pair.quote_currency === 'GBP') { return false }
                return true
            })
            const ticker_pairs = await this.getTickers(filtered_pairs) 
                 
            const arbitrage_pairs = this.getAllArbitrages(ticker_pairs)
            const final = arbitrage_pairs.map(ap => this.calculateArbitrage(ap))
            return final

        } catch (error) { console.log(error)}
    }

    async getTickers(pairs) {
        if (pairs.length === 0) { return [] }
        const interval = 6
        const action_pairs = pairs.slice(0, interval)
        const with_ticker = await Promise.all(action_pairs.map(async pair => {
            const ticker = await this.client.getProductTicker(pair.id)
            return Object.assign({}, pair, ticker)
        }))

        await timeout(1000)
        return with_ticker.concat(await this.getTickers(pairs.slice(interval)))
    }

    getAllArbitrages(all_pairs) {
        const result = all_pairs.reduce((acc, pair) => {
            const { id, base_currency, quote_currency } = pair
            const base_pairs = this.getAllCurrencyPairs(base_currency, all_pairs, id)
            const quote_pairs = this.getAllCurrencyPairs(quote_currency, all_pairs, id)
            const arb_pairs = this.getArbitragePairs(base_pairs, quote_pairs, pair)
            return acc.concat(arb_pairs.slice())
        }, [])

        return result
    }

    getAllCurrencyPairs(currency, all_pairs, exclude_id) {
        const markets = []
        for (let i = 0; i < all_pairs.length; i++) {
            const other = Object.assign({}, all_pairs[i])
            if (other.id === exclude_id) { continue }
            if (currency === other.base_currency) { 
                this.reverseCurrency(other)
                markets.push(other) 
            } else if (currency === other.quote_currency) { markets.push(other) }
        }
        return markets
    }

    reverseCurrency(currency) {
        const temp_quote = currency.quote_currency
        currency.quote_currency = currency.base_currency
        currency.base_currency = temp_quote

        currency.id = currency.base_currency + "-" + currency.quote_currency
        if (!currency.switched) { currency.switched = true }
        else { currency.switched = !currency.switched }        

        return currency
    }

    getArbitragePairs(basePairs, quotePairs, original) {
        const pairs = []
        basePairs.forEach(base => {
            quotePairs.forEach(quote => {
                if (base.base_currency === quote.base_currency) { pairs.push({ original, base, quote }) }
            })
        })
        return pairs
    }    

    calculateArbitrage(pair) {
        const { original, base, quote } = pair

        const one = new Decimal(1)
        const base_price = new Decimal(base.price)
        const quote_price = new Decimal(quote.price)
        const price = new Decimal(original.price)

        const switched_base_price = base.switched ? one.dividedBy(base_price) : base_price
        const switched_quote_price = quote.switched ? one.dividedBy(quote.price) : quote_price

        const arbitragePrice = switched_quote_price.dividedBy(switched_base_price)

        if (arbitragePrice >= price) {
            //calculate arbitrage using bid and ask
        } else {
            //calculate arbitrage using bid and ask
        }
        
        /* if (indicated_price >= price) {
            const percentage = math.divide(math.bignumber(indicated_price), math.bignumber(price))
            return { 
                original: original.id, 
                pair1: base.id, 
                pair2: quote.id,                     
                pair1_price: math.format(adjusted_base_price, { precision }),
                pair2_price: math.format(adjusted_quote_price, { precision }),
                original_price: math.format(price, { precision }),
                triangular_price: math.format(indicated_price, { precision }),
                percentage: math.format(percentage, { precision }),
                time: new Date() 
            }
        } else {
            const percentage = math.divide(math.bignumber(price), math.bignumber(indicated_price))            
            return { 
                original: original.id, 
                pair1: base.id, 
                pair2: quote.id,                     
                pair1_price: math.format(adjusted_base_price, { precision }),
                pair2_price: math.format(adjusted_quote_price, { precision }),
                original_price: math.format(price, { precision }),
                triangular_price: math.format(indicated_price, { precision }),
                percentage: math.format(percentage, { precision }),
                time: new Date()  
            }
        }  */
    }

}

module.exports = CoinbaseProSimpleTriArb
