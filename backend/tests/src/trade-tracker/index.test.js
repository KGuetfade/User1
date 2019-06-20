const TradeTracker = require('../../../src/trade-tracker')
const Trade = require('../../../src/models/trade')

const tracker = new TradeTracker({})

describe('test process trade', () => {
    const params = {
        client_oid: 'asnudnuna',
        type: 'market',
        side: 'sell',
        product_id: 'BTC-EUR',
        size: 10
    }

    const data = {
        type: '',
        product_id: 'BTC-EUR',
        client_oid: 'asnudnuna',
        order_id: 1
    }

    test('trade requested, nothing should happen', () => {
        const trade = new Trade(params)
        trade.stages.requested = true

        data.type = 'change'

        tracker.processTrade(trade, data)
        const { 
            requested, 
            received, 
            matched, 
            done 
        } = trade.stages

        expect(requested).toBe(true)
        expect(received).toBe(false)
        expect(matched).toBe(false)
        expect(done).toBe(false)
    })

    test('trade requested and data received, trade stage received should be updated and order id added', () => {
        const trade = new Trade(params)
        trade.stages.requested = true

        data.type = 'received'

        tracker.processTrade(trade, data)
        const { 
            requested, 
            received, 
            matched, 
            done 
        } = trade.stages

        expect(requested).toBe(true)
        expect(received).toBe(true)
        expect(matched).toBe(false)
        expect(done).toBe(false)
        expect(trade.order_id).toBe(1)
    })

    test('trade received, nothing should happen', () => {
        const trade = new Trade(params)
        trade.stages.requested = true
        trade.stages.received = true

        data.type = 'received'

        tracker.processTrade(trade, data)
        const { 
            requested, 
            received, 
            matched, 
            done 
        } = trade.stages

        expect(requested).toBe(true)
        expect(received).toBe(true)
        expect(matched).toBe(false)
        expect(done).toBe(false)
    })

    test('trade received and data matched, trade stage matched should be updated and match object added', () => {
        const trade = new Trade(params)
        trade.stages.requested = true
        trade.stages.received = true
        trade.order_id = 1

        data.type = 'match'
        data.taker_order_id = 1
        

        tracker.processTrade(trade, data)
        const { 
            requested, 
            received, 
            matched, 
            done 
        } = trade.stages

        expect(requested).toBe(true)
        expect(received).toBe(true)
        expect(matched).toBe(true)
        expect(done).toBe(false)
        expect(trade.match).toEqual(data)
    })

    test('trade matched, nothing should happen', () => {
        const trade = new Trade(params)
        trade.stages.requested = true
        trade.stages.received = true
        trade.stages.matched = true

        data.type = 'matched'

        tracker.processTrade(trade, data)
        const { 
            requested, 
            received, 
            matched, 
            done 
        } = trade.stages

        expect(requested).toBe(true)
        expect(received).toBe(true)
        expect(matched).toBe(true)
        expect(done).toBe(false)
    })

    test('trade matched and data done, trade stage set to done and reason object added (filled) and trade.done()', () => {
        const trade = new Trade(params)
        trade.stages.requested = true
        trade.stages.received = true
        trade.stages.matched =  true
        trade.order_id = 1

        data.type = 'done'
        data.product_id = 'BTC-EUR'
        data.reason = 'filled'

        tracker.processTrade(trade, data)
        const { 
            requested, 
            received, 
            matched, 
            done 
        } = trade.stages

        expect(requested).toBe(true)
        expect(received).toBe(true)
        expect(matched).toBe(true)
        expect(done).toBe(true)
        expect(trade.reason).toBe('filled')
    })

    test('trade done, nothing should happen', () => {
        const trade = new Trade(params)
        trade.stages.requested = true
        trade.stages.received = true
        trade.stages.matched = true
        trade.stages.done = true

        data.type = 'done'

        tracker.processTrade(trade, data)
        const { 
            requested, 
            received, 
            matched, 
            done 
        } = trade.stages

        expect(requested).toBe(true)
        expect(received).toBe(true)
        expect(matched).toBe(true)
        expect(done).toBe(true)
    })

    test('trade received and data canceled, reason should be canceled, done should be true, matched should be false', () => {
        const trade = new Trade(params)
        trade.stages.requested = true
        trade.stages.received = true
        trade.order_id = 1

        data.type = 'done'
        data.reason = 'canceled'
        

        tracker.processTrade(trade, data)
        const { 
            requested, 
            received, 
            matched, 
            done 
        } = trade.stages

        expect(requested).toBe(true)
        expect(received).toBe(true)
        expect(matched).toBe(false)
        expect(done).toBe(true)
        expect(trade.reason).toBe('canceled')
    })
})