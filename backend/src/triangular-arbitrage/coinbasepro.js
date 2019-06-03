const CoinbasePro = require('coinbase-pro')

class CoinbaseProTriArb {
    constructor() {
        this.client = new CoinbasePro.PublicClient('BTC-EUR'); 
    }

    async start() {
        const market_pairs = await this.client.getProducts()
        const filtered_pairs = market_pairs.filter(pair => {
            if (pair.quote_currency === 'USD') { return false }
            if (pair.quote_currency === 'GBP') { return false }
            return true
        })

        /*
        * For each pair loop through all other pairs and check whether the base 
        * or quote is in one of the other pairs.
        */
        const arbitrage = {}

        filtered_pairs.forEach(pair => {
            const { id, base_currency, quote_currency } = pair
            const base_pairs = []
            const quote_pairs = []
            const arb_pairs = []

            for (let i = 0; i < filtered_pairs.length; i++) {
                const { id: other_id } = filtered_pairs[i]
                if (id === other_id) { continue }
                
                if (other_id.includes(base_currency)) { base_pairs.push(other) } 
                else if (other_id.includes(quote_currency)) { quote_pairs.push(other) }
            }

            base_pairs = base_pairs.map(pair => {
                if (base_currency !== pair.quote_currency) { 
                    pair.id = pair.quote_currency + '-' + pair.base_currency
                    const temp_quote = pair.quote_currency
                    pair.quote_currency = pair.base_currency
                    pair.base_currency = temp_quote
                }    
                return pair
            })

            quote_pairs = quote_pairs.map(pair => {
                if (quote_currency !== pair.quote_currency) { 
                    pair.id = pair.quote_currency + '-' + pair.base_currency
                    const temp_quote = pair.quote_currency
                    pair.quote_currency = pair.base_currency
                    pair.base_currency = temp_quote
                }    
                return pair
            })

            base_pairs.forEach(base => {
                quote_pairs.forEach(quote => {
                    if (base.base_currency === quote.base_currency) { arb_pairs.push([base, quote]) }
                })
            })
            
            arbitrage[id] = arb_pairs
        })

    }

}

module.exports = CoinbaseProTriArb
