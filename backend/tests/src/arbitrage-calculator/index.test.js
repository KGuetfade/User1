const ArbitrageCalculator = require('../../../src/arbitrage-calculator')
const BigNumber = require('bignumber.js')

const products = ['BTC-EUR', 'ETH-EUR', 'ETH-BTC']
const calculator = new ArbitrageCalculator(products)

test('Test buy', () => {
    const book = { 'asks': [{price: BigNumber(20), size: BigNumber(5)}] }
    const amount = 5
    const result = calculator.buy(book, amount)
    expect(result).toStrictEqual(BigNumber(5).dividedBy(20))
});

test('Test sell', () => {
    const book = { 'bids': [{price: BigNumber(20), size: BigNumber(5)}] }
    const amount = 5
    const result = calculator.sell(book, amount)
    expect(result).toStrictEqual(BigNumber(5).times(20))
});

test('Test max buy', () => {
    const book = { 'asks': [{price: BigNumber(20), size: BigNumber(5)}] }
    const result = calculator.maxBuy(book)
    expect(result).toStrictEqual(BigNumber(5).times(20))
});

test('Test max sell', () => {
    const book = { 'bids': [{price: BigNumber(20), size: BigNumber(5)}] }
    const result = calculator.maxSell(book)
    expect(result).toStrictEqual(BigNumber(5))
});

test('Test check cycle', () => {
})