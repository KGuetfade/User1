const CoinbasePro = require('coinbase-pro')
const config = require('../configuration')

const key = config.get('COINBASE_PRO_API_KEY')
const secret = config.get('COINBASE_PRO_API_SECRET')
const passphrase = config.get('COINBASE_PRO_API_PASSPHRASE')
const apiURI = config.get('COINBASE_PRO_API_URL')

class AuthenticatedClientProvider {
    constructor() {
        this.authClient = new CoinbasePro.AuthenticatedClient(key, secret, passphrase, apiURI)
        this.time = new Date().getTime()
        this.requests = 0
        this.maxRequests = 5

        if (key === "" || secret === "" || passphrase === "") throw new Error('Please provide api details in config.json.')
    }

    getClient() {
        this.adjustRequests()
        return this.authClient
    }

    getRemainingRequests() {
        const now = new Date().getTime()
        const diff = now - this.time
        if (diff <= 1000) {
            return this.maxRequests - this.requests
        } 
        return this.maxRequests
    }

    adjustRequests() {
        const now = new Date().getTime()
        const diff = now - this.time
        if (diff <= 1000) {
            this.requests++
        } else {
            this.time = now
            this.requests = 1
        }
    }
}

module.exports = exports = AuthenticatedClientProvider