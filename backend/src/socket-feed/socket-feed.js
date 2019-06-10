const { EventEmitter } = require('events')

class SocketFeed extends EventEmitter {
    connect() {}
    disconnect() {}
    remove() {}
    
    onOpen() {}
    onMessage() {}
    onError() {}
    onClose() {}
}

module.exports = exports = SocketFeed