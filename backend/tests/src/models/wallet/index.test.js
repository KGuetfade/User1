const Wallet = require('../../../../src/models/wallet')
const BigNumber = require('bignumber.js')

const products = ['BTC-EUR', 'ETH-EUR', 'ETH-BTC']

const mockProvider = {
    getClient: () => ({
        getAccounts: () => new Promise((resolve, reject) => {
            resolve(products.map(p => ({currency: 'BTC'})))
        })
    })
}

const wallet = new Wallet(products, mockProvider)

describe('test update holds', () => {
    test('add 5 to holds, should return 5', () => {
        wallet.accounts = { 'BTC': { hold: BigNumber(0), balance: BigNumber(10) } }
        wallet.updateHolds('BTC', 5)
        expect(wallet.accounts['BTC'].hold).toStrictEqual(BigNumber(5))
    })

    test('add 5 to holds, then remove 5, should return 0', () => {
        wallet.accounts = { 'BTC': { hold: BigNumber(0), balance: BigNumber(10) } }
        wallet.updateHolds('BTC', 5)
        wallet.updateHolds('BTC', -5)
        expect(wallet.accounts['BTC'].hold).toStrictEqual(BigNumber(0))
    })
})

describe('test update balance', () => {
    test('add 5 to balance, should return 5', () => {
        wallet.accounts = { 'BTC': { balance: BigNumber(0) } }
        wallet.updateBalance('BTC', 5)
        expect(wallet.accounts['BTC'].balance).toStrictEqual(BigNumber(5))
    })

    test('add 5 to balance, then remove 5, should return 0', () => {
        wallet.accounts = { 'BTC': { balance: BigNumber(0) } }
        wallet.updateBalance('BTC', 5)
        wallet.updateBalance('BTC', -5)
        expect(wallet.accounts['BTC'].balance).toStrictEqual(BigNumber(0))
    })
})