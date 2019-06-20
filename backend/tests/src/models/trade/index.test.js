const Trade = require('../../../../src/models/trade')

const trade = new Trade({})

describe('test done', () => {
    test('all stages done and reason filled, should return true', () => {
        trade.stages.requested = true
        trade.stages.received = true
        trade.stages.matched = true
        trade.stages.done = true
        trade.reason = 'filled'
        const done = trade.done()
        expect(done).toBe(true)
    })

    test('all stages done and reason canceled, should return false', () => {
        trade.stages.requested = true
        trade.stages.received = true
        trade.stages.matched = true
        trade.stages.done = true
        trade.reason = 'canceled'
        const done = trade.done()
        expect(done).toBe(false)
    })

    test('one stage not done and reason filled, should return false', () => {
        trade.stages.requested = true
        trade.stages.received = false
        trade.stages.matched = true
        trade.stages.done = true
        trade.reason = 'canceled'
        const done = trade.done()
        expect(done).toBe(false)
    })
})

describe('test canceled', () => {
    test('reason canceled, should return true', () => {
        trade.reason = 'canceled'
        const canceled = trade.canceled()
        expect(canceled).toBe(true)
    })

    test('reason filled, should return false', () => {
        trade.reason = 'filled'
        const canceled = trade.canceled()
        expect(canceled).toBe(false)
    })
})