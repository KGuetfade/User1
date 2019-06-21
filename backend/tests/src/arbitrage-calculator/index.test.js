const ArbitrageCalculator = require('../../../src/arbitrage-calculator')
const BigNumber = require('bignumber.js')

const calculator = new ArbitrageCalculator()

describe('Test buy and sell functions', () => {
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

describe('Test calculate steps function', () => {
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

    test('first and second ids distinct, bad weather', () => {
        const ids = ['LTC-XRP', 'BTC-EUR', 'BTC-XRP']
        const type = 'buy'
        expect(() => {calculator.calculateSteps(ids, type)}).toThrow(Error)
    })
})

describe('Test calculate percentage function', () => {
    test('should return correct percentage', () => {
        const products = [{ id: 'BTC-EUR', orderbook: {
                                                'asks': [{price: BigNumber(8005.33), size:BigNumber(0.1)}], 
                                                'bids': [{price: BigNumber(7999), size:BigNumber(1.3)}]
                          }},
                          { id: 'ETH-BTC', orderbook: {
                                                'asks': [{price: BigNumber(0.23), size:BigNumber(4.3)}], 
                                                'bids': [{price: BigNumber(0.19), size:BigNumber(17)}]
                          }},
                          { id: 'ETH-EUR', orderbook: {
                                                'asks': [{price: BigNumber(231.5), size:BigNumber(1.2)}], 
                                                'bids': [{price: BigNumber(230.65), size:BigNumber(0.4)}]
                          }}]
        const { percentage } = calculator.calculatePercentage(products)
        expect(percentage).toStrictEqual(BigNumber(556.5053995680346))
    })
})

describe('Test check cycle function', () => {
    test('first step lowest volume', () => {
        const products = [{ id: 'BTC-EUR', orderbook: { 
                                                'bids': [{price: BigNumber(7999), size:BigNumber(0.03)}]
                         }},
                         { id: 'ETH-BTC', orderbook: {
                                                'bids': [{price: BigNumber(0.19), size:BigNumber(17)}]
                         }},
                         { id: 'ETH-EUR', orderbook: {
                                                'asks': [{price: BigNumber(231.5), size:BigNumber(1.2)}]
                         }}]
        const steps = [{type: 'sell', index: 0, id: 'BTC-EUR', size: BigNumber(0.03)},
                       {type: 'buy', index: 2, id: 'ETH-EUR', funds: BigNumber(277.8)},
                       {type: 'sell', index: 1, id: 'ETH-BTC', size: BigNumber(17)}]
        
        const u1 = calculator.checkCycle(products, steps, 0)
        const u2 = calculator.checkCycle(products, steps, 1)
        const u3 = calculator.checkCycle(products, steps, 2)

        expect(u1).toBe(true)
        expect(u2).toBe(false)
        expect(u3).toBe(false)
    })

    test('second step lowest volume', () => {
        const products = [{ id: 'BTC-EUR', orderbook: { 
                                            'bids': [{price: BigNumber(7999), size:BigNumber(0.04)}]
                         }},
                         { id: 'ETH-BTC', orderbook: {
                                            'bids': [{price: BigNumber(0.19), size:BigNumber(17)}]
                         }},
                         { id: 'ETH-EUR', orderbook: {
                                            'asks': [{price: BigNumber(231.5), size:BigNumber(0.2)}]
     }}]
        const steps = [{type: 'sell', index: 0, id: 'BTC-EUR', size: BigNumber(0.04)},
                       {type: 'buy', index: 2, id: 'ETH-EUR', funds: BigNumber(46.3)},
                       {type: 'sell', index: 1, id: 'ETH-BTC', size: BigNumber(17)}]
        
        const u1 = calculator.checkCycle(products, steps, 0)
        const u2 = calculator.checkCycle(products, steps, 1)
        const u3 = calculator.checkCycle(products, steps, 2)

        expect(u1).toBe(false)
        expect(u2).toBe(true)
        expect(u3).toBe(false)
    })

    test('third step lowest volume', () => {
        const products = [{ id: 'BTC-EUR', orderbook: { 
                                            'bids': [{price: BigNumber(7999), size:BigNumber(1)}]
                         }},
                         { id: 'ETH-BTC', orderbook: {
                                            'bids': [{price: BigNumber(0.19), size:BigNumber(.9)}]
                         }},
                         { id: 'ETH-EUR', orderbook: {
                                            'asks': [{price: BigNumber(231.5), size:BigNumber(6)}]
     }}]
        const steps = [{type: 'sell', index: 0, id: 'BTC-EUR', size: BigNumber(1)},
                       {type: 'buy', index: 2, id: 'ETH-EUR', funds: BigNumber(1389)},
                       {type: 'sell', index: 1, id: 'ETH-BTC', size: BigNumber(.9)}]
        
        const u1 = calculator.checkCycle(products, steps, 0)
        const u2 = calculator.checkCycle(products, steps, 1)
        const u3 = calculator.checkCycle(products, steps, 2)

        expect(u1).toBe(false)
        expect(u2).toBe(false)
        expect(u3).toBe(true)
    })

    test('no common lowest volume', () => {
        const products = [{ id: 'BTC-EUR', orderbook: { 
                                            'bids': [{price: BigNumber(7999), size:BigNumber(0.03)}]
                         }},
                         { id: 'ETH-BTC', orderbook: {
                                            'bids': [{price: BigNumber(0.19), size:BigNumber(17)}]
                         }},
                         { id: 'ETH-EUR', orderbook: {
                                            'asks': [{price: BigNumber(231.5), size:BigNumber(0.2)}]
                         }}]
        const steps = [{type: 'sell', index: 0, id: 'BTC-EUR', size: BigNumber(0.03)},
                       {type: 'buy', index: 2, id: 'ETH-EUR', funds: BigNumber(46.3)},
                       {type: 'sell', index: 1, id: 'ETH-BTC', size: BigNumber(17)}]

        const u1 = calculator.checkCycle(products, steps, 0)
        const u2 = calculator.checkCycle(products, steps, 1)
        const u3 = calculator.checkCycle(products, steps, 2)

        expect(u1).toBe(false)
        expect(u2).toBe(false)
        expect(u3).toBe(false)
    })

    test('two common lowest volume', () => {
        const products = [{ id: 'BTC-EUR', orderbook: { 
                                            'bids': [{price: BigNumber(7999), size:BigNumber(0.05)}]
                         }},
                         { id: 'ETH-BTC', orderbook: {
                                            'bids': [{price: BigNumber(0.026), size:BigNumber(17)}]
                         }},
                         { id: 'ETH-EUR', orderbook: {
                                            'asks': [{price: BigNumber(231.5), size:BigNumber(1.8)}]
                         }}]
        const steps = [{type: 'sell', index: 0, id: 'BTC-EUR', size: BigNumber(0.05)},
                       {type: 'buy', index: 2, id: 'ETH-EUR', funds: BigNumber(416.7)},
                       {type: 'sell', index: 1, id: 'ETH-BTC', size: BigNumber(17)}]

        const u1 = calculator.checkCycle(products, steps, 0)
        const u2 = calculator.checkCycle(products, steps, 1)
        const u3 = calculator.checkCycle(products, steps, 2)

        expect(u1).toBe(true)
        expect(u2).toBe(true)
        expect(u3).toBe(false)
    })
})

describe('Test adjust sizes', () => {
    test('adjust size to first', () => {
        const products = [{ id: 'BTC-EUR', orderbook: { 
                                            'bids': [{price: BigNumber(7999), size:BigNumber(0.03)}]
                         }},
                         { id: 'ETH-BTC', orderbook: {
                                            'bids': [{price: BigNumber(0.19), size:BigNumber(17)}]
                         }},
                         { id: 'ETH-EUR', orderbook: {
                                            'asks': [{price: BigNumber(231.5), size:BigNumber(1.2)}]
                         }}]
        const steps = [{type: 'sell', index: 0, id: 'BTC-EUR', size: BigNumber(0.03)},
                       {type: 'buy', index: 2, id: 'ETH-EUR', funds: BigNumber(277.8)},
                       {type: 'sell', index: 1, id: 'ETH-BTC', size: BigNumber(17)}]

        calculator.adjustSizes(products, steps, 0)

        expect(steps[0].size).toStrictEqual(BigNumber(0.03))
        expect(steps[1].funds).toStrictEqual(BigNumber(239.97))
        expect(steps[2].size.toFixed(9)).toStrictEqual(BigNumber(1.036587473).toFixed(9))
    })

    test('adjust size to second', () => {
        const products = [{ id: 'BTC-EUR', orderbook: { 
                                            'bids': [{price: BigNumber(7999), size:BigNumber(0.03)}]
                         }},
                         { id: 'ETH-BTC', orderbook: {
                                            'bids': [{price: BigNumber(0.19), size:BigNumber(17)}]
                         }},
                         { id: 'ETH-EUR', orderbook: {
                                            'asks': [{price: BigNumber(231.5), size:BigNumber(1.2)}]
                         }}]
        const steps = [{type: 'sell', index: 0, id: 'BTC-EUR', size: BigNumber(0.03)},
                       {type: 'buy', index: 2, id: 'ETH-EUR', funds: BigNumber(277.8)},
                       {type: 'sell', index: 1, id: 'ETH-BTC', size: BigNumber(17)}]

        calculator.adjustSizes(products, steps, 1)

        expect(steps[0].size).toStrictEqual(BigNumber(0.228))
        expect(steps[1].funds).toStrictEqual(BigNumber(277.8))
        expect(steps[2].size).toStrictEqual(BigNumber(1.2))
    })

    test('adjust size to third', () => {
        const products = [{ id: 'BTC-EUR', orderbook: { 
                                            'bids': [{price: BigNumber(7999), size:BigNumber(0.03)}]
                         }},
                         { id: 'ETH-BTC', orderbook: {
                                            'bids': [{price: BigNumber(0.19), size:BigNumber(17)}]
                         }},
                         { id: 'ETH-EUR', orderbook: {
                                            'asks': [{price: BigNumber(231.5), size:BigNumber(1.2)}]
                         }}]
        const steps = [{type: 'sell', index: 0, id: 'BTC-EUR', size: BigNumber(0.03)},
                       {type: 'buy', index: 2, id: 'ETH-EUR', funds: BigNumber(277.8)},
                       {type: 'sell', index: 1, id: 'ETH-BTC', size: BigNumber(17)}]

        calculator.adjustSizes(products, steps, 2)

        expect(steps[0].size).toStrictEqual(BigNumber(3.23))
        expect(steps[1].funds).toStrictEqual(BigNumber(25836.77))
        expect(steps[2].size).toStrictEqual(BigNumber(17))
    })
})

describe('Test delete sizes', () => {
    test('should delete funds and sizes', () => {
        const steps = [{type: 'sell', index: 0, id: 'BTC-EUR', size: BigNumber(0.03)},
                       {type: 'buy', index: 2, id: 'ETH-EUR', funds: BigNumber(277.8)},
                       {type: 'sell', index: 1, id: 'ETH-BTC', size: BigNumber(17)}]

        calculator.deleteSizes(steps)

        expect(steps[0].size).toBe(undefined)
        expect(steps[1].funds).toBe(undefined)
        expect(steps[2].size).toBe(undefined)
    })
})
