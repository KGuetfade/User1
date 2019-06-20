const ArbitrageUnit = require('../../../../src/models/arbitrage-unit')

describe('test create', () => {
    const steps = [{ id: 'BTC-EUR', type: 'buy', funds: 100 }, 
                   { id: 'ETH-EUR', type: 'sell', size: 17 }, 
                   { id: 'ETH-BTC', type: 'buy', funds: .3 }]

    test('should create three trade objects out of steps', () => {
        const unit = new ArbitrageUnit(1, steps, { locks: 0 })
        const trades = unit.trades
        expect(trades).toBeTruthy()
        expect(trades.length).toBe(3)
    
        const t1 = trades[0]

        expect(t1.params.type).toBe('market')
        expect(t1.params.side).toBe(steps[0].type)
        expect(t1.params.product_id).toBe(steps[0].id)
        expect(t1.params.funds).toBe(steps[0].funds)
    })
})

describe('test done', () => {
    const steps = [{ id: 'BTC-EUR', type: 'buy', funds: 100 }, 
                   { id: 'ETH-EUR', type: 'sell', size: 17 }, 
                   { id: 'ETH-BTC', type: 'buy', funds: .3 }]

    test('all done, should return true', () => {
        const unit = new ArbitrageUnit(1, steps, { locks: 0, unlocks: 0 })
        unit.trades.forEach(trade => {
            trade.stages.requested = true
            trade.stages.received = true
            trade.stages.matched = true
            trade.stages.done = true
            trade.reason = 'filled'
        })

        const done = unit.done()
        expect(done).toBe(true)
    })

    test('all not done, should return false', () => {
        const unit = new ArbitrageUnit(1, steps, { locks: 0, unlocks: 0 })
        unit.trades.forEach(trade => {
            trade.stages.requested = true
            trade.stages.received = true
            trade.stages.matched = true
            trade.stages.done = false
            trade.reason = 'filled'
        })

        const done = unit.done()
        expect(done).toBe(false)
    })

    test('all canceled, should return false', () => {
        const unit = new ArbitrageUnit(1, steps, { locks: 0, unlocks: 0 })
        unit.trades.forEach(trade => {
            trade.stages.requested = true
            trade.stages.received = true
            trade.stages.matched = true
            trade.stages.done = true
            trade.reason = 'canceled'
        })

        const done = unit.done()
        expect(done).toBe(false)
    })
})

describe('test canceled', () => {
    const steps = [{ id: 'BTC-EUR', type: 'buy', funds: 100 }, 
                   { id: 'ETH-EUR', type: 'sell', size: 17 }, 
                   { id: 'ETH-BTC', type: 'buy', funds: .3 }]

    test('all canceled, should return true', () => {
        const unit = new ArbitrageUnit(1, steps, { locks: 0, unlocks: 0 })
        unit.trades.forEach(trade => {
            trade.reason = 'canceled'
        })

        const canceled = unit.canceled()
        expect(canceled).toBe(true)
    })

    test('all filled, should return false', () => {
        const unit = new ArbitrageUnit(1, steps, { locks: 0, unlocks: 0 })
        unit.trades.forEach(trade => {
            trade.reason = 'filled'
        })

        const canceled = unit.canceled()
        expect(canceled).toBe(false)
    })

})