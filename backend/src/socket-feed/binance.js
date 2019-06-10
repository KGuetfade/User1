const config = require('../configuration')
const SocketFeed = require('./socket-feed')
const WebSocket = require('ws')

const url = config.get("BINANCE_WS_URL")

class Binance extends SocketFeed{
    constructor(productID) {
        super()
        this.url = url
        this.productID = productID
        this.channel = `/ws/${this.productID.toLowerCase()}@trade`
    }

    connect() {
        if (this.socket &&
            (this.socket.readyState !== WebSocket.CLOSED &&
            this.socket.readyState !== WebSocket.CLOSING)
        ) {
          throw new Error('Could not connect (not disconnected)');
        }

        this.socket = new WebSocket(this.url.concat(this.channel));
    
        this.socket.on('message', this.onMessage.bind(this));
        this.socket.on('open', this.onOpen.bind(this));
        this.socket.on('close', this.onClose.bind(this));
        this.socket.on('error', this.onError.bind(this));
        this.socket.on('ping', data => this.socket.pong())
    }

    disconnect() {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            throw new Error('Could not disconnect (not connected)');
        }
        this.socket.close();
    }

    onOpen() {
        this.emit('open');
    }
    
    onClose() {
        this.emit('close');
    }

    onMessage(data) {
        const message = JSON.parse(data);
        if (message.code) {
            this.onError(message);
        } else {
            this.emit('message', message);
        }
    }

    onError(err) {
        if (!err) {
            return;
        }

        this.emit('error', err);
    }
}

module.exports = exports = Binance