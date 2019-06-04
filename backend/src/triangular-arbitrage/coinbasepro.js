const CoinbasePro = require('coinbase-pro')
const util = require('util')
const Decimal = require('decimal.js')

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

class CoinbaseProTriArbScanner {
    constructor() {
        this.client = new CoinbasePro.PublicClient(); 
        this.initialized = false
    }

    print(obj) {
        console.log(util.inspect(obj, {showHidden: false, depth: null}))
    }

    async initialize() {
        const market_pairs = await this.client.getProducts()
        const filtered_pairs = market_pairs.filter(pair => {
            if (pair.quote_currency === 'USD') { return false }
            if (pair.quote_currency === 'GBP') { return false }
            return true
        })      
        const duplicates = this.getArbitragePairs(filtered_pairs)
        const sorted = duplicates.sort((a,b) => {
            if (a.original < b.original) { return -1 }
            else if ( a.original > b.original) { return 1 }
            else { return 0 }
        })
        this.arbitrage_pairs = this.removeDuplicates(sorted)
        this.initialized = true
    }

    async start() {
        if (!this.initialized) { throw new Error("Please initialize object before calling start()") }
        try {
            const final = []
            for (let i = 0; i < this.arbitrage_pairs.length; i++) {
                const pairs = this.arbitrage_pairs[i]
                const data = await this.getTickers(pairs)
                final.push(data)
                /* const arbitrage = this.calculateArbitrage(data)
                final.push(arbitrage) */
                await timeout(500)
            }
            return final 
        } catch (error) { console.log(error)}
    }

    async getTickers(arbitragePairs) {
        const original = this.client.getProductTicker(arbitragePairs.original)
        const base = this.client.getProductTicker(arbitragePairs.base)
        const quote = this.client.getProductTicker(arbitragePairs.quote)
        const result = await Promise.all([original, base, quote])
        return { 
            original: {id: arbitragePairs.original, ...result[0]}, 
            base: {id: arbitragePairs.base, ...result[1]}, 
            quote: {id: arbitragePairs.quote, ...result[2]} 
        }
    }

    getArbitragePairs(allPairs) {
        const result = allPairs.reduce((acc, pair) => {
            const { id, base_currency, quote_currency } = pair
            const base_pairs = this.getAllCurrencyPairs(base_currency, allPairs, id)
            const quote_pairs = this.getAllCurrencyPairs(quote_currency, allPairs, id)
            const arb_pairs = this.findArbitrageCombinations(base_pairs, quote_pairs, pair)
            return acc.concat(arb_pairs.slice())
        }, [])

        return result
    }

    getAllCurrencyPairs(currency, allPairs, exclude_id) {
        const markets = []
        for (let i = 0; i < allPairs.length; i++) {
            const other = Object.assign({}, allPairs[i])
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

    findArbitrageCombinations(basePairs, quotePairs, original) {
        return basePairs.reduce((acc, base) => {
                quotePairs.forEach(quote => {
                    if (base.base_currency === quote.base_currency) {

                        const copy_base = Object.assign({}, base)
                        const copy_quote = Object.assign({}, quote)
                        if (copy_base.switched) { this.reverseCurrency(copy_base) }
                        if (copy_quote.switched) { this.reverseCurrency(copy_quote) }
                        
                        acc.push({ 
                            original : original.id, 
                            base: copy_base.id, 
                            quote: copy_quote.id 
                        }) 
                    }
                })
                return acc
        }, [])
    }    

    removeDuplicates(arbitragePairs) {
        return arbitragePairs.reduce((acc, pair) => {
            let duplicate = false
            acc.forEach(a => {
                if (pair.original === a.base) {
                    if (pair.base === a.original || pair.base === a.quote) {
                        duplicate = true
                    } 
                } else if (pair.original === a.quote) {
                    if (pair.base === a.original || pair.base === a.base) {
                        duplicate = true
                    }
                }
            })
            if (!duplicate) { acc.push(pair) }
            return acc
        }, [])
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

module.exports = CoinbaseProTriArbScanner
