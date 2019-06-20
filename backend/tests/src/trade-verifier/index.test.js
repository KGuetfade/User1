const TradeVerifier = require('../../../src/trade-verifier')
const Trade = require('../../../src/models/trade')
const BigNumber = require('bignumber.js')

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

describe('test get net', () => {
    const t1 = new Trade({ product_id: 'BTC-EUR', side: 'buy' })
    const t2 = new Trade({ product_id: 'ETH-EUR', side: 'sell' })
    const t3 = new Trade({ product_id: 'ETH-BTC', side: 'buy' })

    t1.match = { size: BigNumber(.3), price: BigNumber(8403.23) }
    t2.match = { size: BigNumber(.3), price: BigNumber(243.33) }
    t3.match = { size: BigNumber(.3), price: BigNumber(0.02345) }

    test('get net btc, should return ', () => {
        const net = verifier.getNet('BTC', [t1, t2, t3])
        expect(net.toFixed(6)).toBe('0.292965')
    })

    test('get net eth, should return ', () => {
        const net = verifier.getNet('ETH', [t1, t2, t3])
        expect(net.toFixed(6)).toBe('0.000000')
    })

    test('get net eur, should return ', () => {
        const net = verifier.getNet('EUR', [t1, t2, t3])
        expect(net.toFixed(6)).toBe('-2447.970000')
    })
})