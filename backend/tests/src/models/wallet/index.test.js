const Wallet = require('../../../../src/models/wallet')

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
        wallet.accounts = { 'BTC': { hold: 0 } }
        wallet.updateHolds('BTC', 5)
        expect(wallet.accounts['BTC'].hold).toBe(5)
    })

    test('add 5 to holds, then remove 5, should return 0', () => {
        wallet.accounts = { 'BTC': { hold: 0 } }
        wallet.updateHolds('BTC', 5)
        wallet.updateHolds('BTC', -5)
        expect(wallet.accounts['BTC'].hold).toBe(0)
    })
})

describe('test update balance', () => {
    test('add 5 to balance, should return 5', () => {
        wallet.accounts = { 'BTC': { balance: 0 } }
        wallet.updateBalance('BTC', 5)
        expect(wallet.accounts['BTC'].balance).toBe(5)
    })

    test('add 5 to balance, then remove 5, should return 0', () => {
        wallet.accounts = { 'BTC': { balance: 0 } }
        wallet.updateBalance('BTC', 5)
        wallet.updateBalance('BTC', -5)
        expect(wallet.accounts['BTC'].balance).toBe(0)
    })
})