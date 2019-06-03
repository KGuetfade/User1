const CoinbasePro = require('coinbase-pro')

class CoinbaseProTriArb {
    constructor() {
        this.client = new CoinbasePro.PublicClient('BTC-EUR'); 
    }

    async start() {
        const market_pairs = await this.client.getProducts()
        console.log(market_pairs)
    }

}

module.exports = CoinbaseProTriArb
