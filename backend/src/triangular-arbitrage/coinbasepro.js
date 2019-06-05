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
                const data = await this.getOrderbook(pairs)
                const arbitrage = this.calculateArbitrage(data)
                final.push(arbitrage)
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

    async getOrderbook(arbitragePairs, level=1) {
        const original = this.client.getProductOrderBook(arbitragePairs.original, { level })
        const base = this.client.getProductOrderBook(arbitragePairs.base, { level })
        const quote = this.client.getProductOrderBook(arbitragePairs.quote, { level })
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
                this.reverseQuoteBase(other)
                markets.push(other) 
            } else if (currency === other.quote_currency) { markets.push(other) }
        }
        return markets
    }

    reverseQuoteBase(currency) {
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
                        if (copy_base.switched) { this.reverseQuoteBase(copy_base) }
                        if (copy_quote.switched) { this.reverseQuoteBase(copy_quote) }
                        
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

        const base_quote = this.getTriangleBaseQuote(pair)
        const quote_base = this.getTriangleQuoteBase(pair)

        return {
            original,
            base,
            quote,
            base_quote,
            quote_base
        }
        
    }

    getBase(id) {
        return id.split('-')[0]
    }

    getQuote(id) {
        return id.split('-')[1]
    }

    deepClone(arr) {
        return [[...arr[0]]]
    }

    reverseBidAsk(currency) {
        const base = this.getQuote(currency.id)
        const quote = this.getBase(currency.id)
        currency.id = base + '-' + quote

        const temp_bids = this.deepClone(currency.bids)
        currency.bids = this.deepClone(currency.asks)
        currency.asks = temp_bids

        currency.bids[0][1] = (new Decimal(currency.bids[0][0])).times(currency.bids[0][1]).toString()
        currency.bids[0][0] = (new Decimal(1)).dividedBy(currency.bids[0][0]).toString()

        currency.asks[0][1] = (new Decimal(currency.asks[0][0])).times(currency.asks[0][1]).toString()
        currency.asks[0][0] = (new Decimal(1)).dividedBy(currency.asks[0][0]).toString()
    }

    shouldReverseBidAsk(original, currency) {
        if (this.getQuote(currency.id) !== this.getBase(original.id)) {
            if (this.getQuote(currency.id) !== this.getQuote(original.id)) {
                return true
            }
        }
        return false
    }

    getTriangleBaseQuote(pair, size=false) {
        const original = Object.assign({}, pair.original)
        const base = Object.assign({}, pair.base)
        const quote = Object.assign({}, pair.quote)
        
        if (this.shouldReverseBidAsk(original, base)) { this.reverseBidAsk(base) }
        if (this.shouldReverseBidAsk(original, quote)) { this.reverseBidAsk(quote) }

        const start = new Decimal('1')
        const trade1 = start.times(original.bids[0][0])
        const trade2 = trade1.dividedBy(quote.asks[0][0])
        const trade3 = trade2.times(base.bids[0][0])
            
        const percentage = trade3.dividedBy(start).minus(1).times(100)
        return percentage
    }

    getTriangleQuoteBase(pair, size=false) {
        const original = Object.assign({}, pair.original)
        const base = Object.assign({}, pair.base)
        const quote = Object.assign({}, pair.quote)
        
        if (this.shouldReverseBidAsk(original, base)) { this.reverseBidAsk(base) }
        if (this.shouldReverseBidAsk(original, quote)) { this.reverseBidAsk(quote) }

        const start = new Decimal('1')
        const trade1 = start.dividedBy(original.asks[0][0])
        const trade2 = trade1.dividedBy(base.asks[0][0])
        const trade3 = trade2.times(quote.bids[0][0])
        
        const percentage = trade3.dividedBy(start).minus(1).times(100)
        return percentage
    }

    maxSizeBaseQuote(original, base, quote) {
        let smallest_amount = original.size

        const amount_orignal = (new Decimal(original.price)).times(smallest_amount)
        let amount_quote = (new Decimal(amount_orignal)).dividedBy(quote.price)

        if (amount_quote >= quote.size) {
            amount_quote = (new Decimal(quote.price)).times(quote.size)
            smallest_amount = amount_quote.dividedBy(original.price)
            
        }

        let amount_base = amount_quote.times(base.price)
        if (amount_base >=  base.size) {
            amount_base = (new Decimal(base.size)).dividedBy(base.price)
            amount_quote = amount_base.times(quote.price)
            smallest_amount = amount_quote.dividedBy(original.price)
        }

        return smallest_amount
    }

    maxSizeQuoteBase(pair) {

    }

}

module.exports = CoinbaseProTriArbScanner
