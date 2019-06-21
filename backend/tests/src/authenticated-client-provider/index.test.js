const ClientProvider = require('../../../src/authenticated-client-provider')

describe('test adjust requests', () => {
    test('call few times, should return n of calls', () => {
        const provider = new ClientProvider()
        expect(provider.requests).toBe(0)
        provider.adjustRequests()
        provider.adjustRequests()
        expect(provider.requests).toBe(2)
    })    

    test('time reset, should reset requests to 1', () => {
        const provider = new ClientProvider()
        expect(provider.requests).toBe(0)
        provider.adjustRequests()
        provider.adjustRequests()
        expect(provider.requests).toBe(2)

        provider.time = new Date().getTime() - 1001

        provider.adjustRequests()
        expect(provider.requests).toBe(1)
    })    
})

describe('test get remaining requests', () => {
    test('nothing happend, should return 5', () => {
        const provider = new ClientProvider()
        expect(provider.getRemainingRequests()).toBe(5)
    })    

    test('2 requests should return 3', () => {
        const provider = new ClientProvider()
        provider.adjustRequests()
        provider.adjustRequests()
        expect(provider.getRemainingRequests()).toBe(3)
    })    

    test('time reset, should return 4', () => {
        const provider = new ClientProvider()
        provider.adjustRequests()
        provider.adjustRequests()
        expect(provider.getRemainingRequests()).toBe(3)

        provider.time = new Date().getTime() - 1001
        expect(provider.getRemainingRequests()).toBe(5)
    })    
})
