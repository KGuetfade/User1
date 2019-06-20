const TradeFirewall = require('../../../src/trade-firewall')
const BigNumber = require('bignumber.js')

const products = ['BTC-EUR', 'ETH-EUR', 'ETH-BTC']

const mockProvider = {
    getClient: () => ({
        getProducts: () => new Promise((resolve, reject) => {
            resolve(products.map(p => ({id:p})))
        })
    })
}

const firewall = new TradeFirewall(products, mockProvider)

describe('test check percentage function', () => {
    test('percentage less than fee, should return false', () => {
        const percentage = BigNumber(.3)
        const fee = .75
        const check = firewall.checkPercentage(percentage, fee)
        expect(check).toBe(false)
    })

    test('percentage more than fee, should return true', () => {
        const percentage = BigNumber(.8)
        const fee = .75
        const check = firewall.checkPercentage(percentage, fee)
        expect(check).toBe(true)
    })
})

describe('test check unlocked function', () => {
    test('status locked, should return false', () => {
        const state = { status: 'locked' }
        const locked = firewall.checkUnlocked(state)
        expect(locked).toBe(false)
    })

    test('status unlocked, should return true', () => {
        const state = { status: 'unlocked' }
        const locked = firewall.checkUnlocked(state)
        expect(locked).toBe(true)
    })
})

describe('test check client function', () => {
    test('remaining less than 3, should return false', () => {
        const client = { getRemainingRequests: () => 2 }
        const check = firewall.checkClient(client)
        expect(check).toBe(false)
    })

    test('remaining more than 3, should return true', () => {
        const client = { getRemainingRequests: () => 4 }
        const check = firewall.checkClient(client)
        expect(check).toBe(true)
    })
})

describe('test check balances function', () => {
    const steps = [{ id: 'BTC-EUR', funds: BigNumber(50) },
                   { id: 'ETH-EUR', size: BigNumber(75) },
                   { id: 'ETH-BTC', funds: BigNumber(33) }]

    const wallet = {
        accounts: {
            'BTC' : { available: 40 }, //33
            'ETH' : { available:  80 }, //75
            'EUR' : { available: 60 } //50
        }
    }

    test('all balances correct, should return true', () => {
        const check = firewall.checkBalances(steps, wallet)
        expect(check).toBe(true)
    })

    test('fund to small, should return false', () => {
        wallet.accounts['BTC'].available = 27
        const check = firewall.checkBalances(steps, wallet)
        expect(check).toBe(false)
    })

    test('size to small, should return false', () => {
        wallet.accounts['ETH'].available = .1
        const check = firewall.checkBalances(steps, wallet)
        expect(check).toBe(false)
    })

    test('no funds or size, should throw error', () => {
        delete steps[0].funds 
        expect(() => firewall.checkBalances(steps, wallet)).toThrow(Error)
    })

})

describe('test check size limits', () => {
    const steps = [{ id: 'BTC-EUR', funds: BigNumber(50) },
                   { id: 'ETH-EUR', size: BigNumber(75) },
                   { id: 'ETH-BTC', funds: BigNumber(33) }]
   
    const bases = products.reduce((acc, p) => { 
        acc[p] = {
            id: p,
            base_min_size: 5,
            base_max_size: 100,
            min_market_funds: .1,
            max_market_funds: 5000 
        }
        return acc
    }, {})

    beforeEach(() => firewall.bases = bases)

    test('steps within limits, should return true', () => {
        const check = firewall.checkSizeLimits(steps)
        expect(check).toBe(true)
    })

    test('fund too small, should return false', () => {
        steps[0].funds = BigNumber(0.05)
        const check = firewall.checkSizeLimits(steps)
        expect(check).toBe(false)
    })

    test('fund too big, should return false', () => {
        steps[0].funds = BigNumber(10000)
        const check = firewall.checkSizeLimits(steps)
        expect(check).toBe(false)
    })

    test('size too small, should return false', () => {
        steps[1].size = BigNumber(2.99999999)
        const check = firewall.checkSizeLimits(steps)
        expect(check).toBe(false)
    })

    test('size too big, should return false', () => {
        steps[1].size = BigNumber(169.342)
        const check = firewall.checkSizeLimits(steps)
        expect(check).toBe(false)
    })

    test('no funds or size, should throw error', () => {
        delete steps[0].funds 
        expect(() => firewall.checkSizeLimits(steps)).toThrow(Error)
    })

})