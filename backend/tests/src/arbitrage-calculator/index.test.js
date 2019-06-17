const ArbitrageCalculator = require('../../../src/arbitrage-calculator')
const BigNumber = require('bignumber.js')

const calculator = new ArbitrageCalculator()

describe('Testing buy and sell functions', () => {
    test('Buy, should return amount / price, good weather', () => {
        const book = { 'asks': [{price: BigNumber(20), size: BigNumber(5)}] }
        const amount = 5
        const result = calculator.buy(book, amount)
        expect(result).toStrictEqual(BigNumber(5).dividedBy(20))
    });
    
    test('Sell, should return amount * price, good weather', () => {
        const book = { 'bids': [{price: BigNumber(20), size: BigNumber(5)}] }
        const amount = 5
        const result = calculator.sell(book, amount)
        expect(result).toStrictEqual(BigNumber(5).times(20))
    });
    
    test('Max buy, should return price * size, good weather', () => {
        const book = { 'asks': [{price: BigNumber(20), size: BigNumber(5)}] }
        const result = calculator.maxBuy(book)
        expect(result).toStrictEqual(BigNumber(5).times(20))
    });
    
    test('Max sell, should return size, good weather', () => {
        const book = { 'bids': [{price: BigNumber(20), size: BigNumber(5)}] }
        const result = calculator.maxSell(book)
        expect(result).toStrictEqual(BigNumber(5))
    });
})

describe('Testing calculate steps function', () => {
    test('type buy, normal ids, good weather', () => {
        const ids = ['BTC-EUR', 'ETH-EUR', 'ETH-BTC']
        const type = 'buy'
        const steps = calculator.calculateSteps(ids, type)
        expect(steps.length).toBe(3)
        expect(steps[0]).toEqual({ type: 'buy', index: 0, id: ids[0] })
        expect(steps[1]).toEqual({ type: 'buy', index: 2, id: ids[2] })
        expect(steps[2]).toEqual({ type: 'sell', index: 1, id: ids[1] })
    })
    
    test('type sell, normal ids, good weather', () => {
        const ids = ['BTC-EUR', 'ETH-EUR', 'ETH-BTC']
        const type = 'sell'
        const steps = calculator.calculateSteps(ids, type)
        expect(steps.length).toBe(3)
        expect(steps[0]).toEqual({ type: 'sell', index: 0, id: ids[0] })
        expect(steps[1]).toEqual({ type: 'buy', index: 1, id: ids[1] })
        expect(steps[2]).toEqual({ type: 'sell', index: 2, id: ids[2] })
    })
    
    test('type buy, random ids, good weather', () => {
        const ids = ['LTC-XRP', 'LTC-BTC', 'BTC-XRP']
        const type = 'buy'
        const steps = calculator.calculateSteps(ids, type)
        expect(steps.length).toBe(3)
        expect(steps[0]).toEqual({ type: 'buy', index: 0, id: ids[0] })
        expect(steps[1]).toEqual({ type: 'sell', index: 1, id: ids[1] })
        expect(steps[2]).toEqual({ type: 'sell', index: 2, id: ids[2] })
    })
    
    test('type sell, random ids, good weather', () => {
        const ids = ['LTC-XRP', 'LTC-BTC', 'BTC-XRP']
        const type = 'sell'
        const steps = calculator.calculateSteps(ids, type)
        expect(steps.length).toBe(3)
        expect(steps[0]).toEqual({ type: 'sell', index: 0, id: ids[0] })
        expect(steps[1]).toEqual({ type: 'buy', index: 2, id: ids[2] })
        expect(steps[2]).toEqual({ type: 'buy', index: 1, id: ids[1] })
    })

    test('first and second ids )
})
