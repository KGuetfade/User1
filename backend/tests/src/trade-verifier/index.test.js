const TradeVerifier = require('../../../src/trade-verifier')
const Trade = require('../../../src/models/trade')

const verifier = new TradeVerifier({})

describe('test get distinct', () => {    
    test('should return all distinct currencies', () => {
        const t1 = new Trade({ product_id: 'BTC-EUR' })
        const t2 = new Trade({ product_id: 'ETH-EUR' })
        const t3 = new Trade({ product_id: 'ETH-BTC' })

        const distincts = verifier.getDistinct([t1, t2, t3])

        expect(distincts.length).toBe(3)
        expect(distincts[0]).toBe('EUR')
        expect(distincts[1]).toBe('BTC')
        expect(distincts[2]).toBe('ETH')

    })
})

describe('test net', () => {
    test('', () => {
        
    })
})