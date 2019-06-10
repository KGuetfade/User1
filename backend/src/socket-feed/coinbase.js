const config = require('../configuration')
const SocketFeed = require('./socket-feed')
const WebSocket = require('ws')

const url = config.get("COINBASE_PRO_WS_URL")

class Coinbase extends SocketFeed{
    constructor(productIDs) {
        super()
        this.url = url
        this.channels = ['full', 'heartbeat']
        this.productIDs = productIDs
    }

    connect() {
        if (this.socket &&
            (this.socket.readyState !== WebSocket.CLOSED &&
            this.socket.readyState !== WebSocket.CLOSING)
        ) {
          throw new Error('Could not connect (not disconnected)');
        }
    
        this.socket = new WebSocket(this.url);
    
        this.socket.on('message', this.onMessage.bind(this));
        this.socket.on('open', this.onOpen.bind(this));
        this.socket.on('close', this.onClose.bind(this));
        this.socket.on('error', this.onError.bind(this));
    }

    disconnect() {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            throw new Error('Could not disconnect (not connected)');
        }
        this.socket.close();
    }

    onOpen() {
        this.emit('open');
        this.subscribe()
    }
    
    onClose() {
        this.emit('close');
    }

    onMessage(data) {
        const message = JSON.parse(data);
        if (message.type === 'error') {
            this.onError(message);
        } else {
            this.emit('message', message);
        }
    }

    onError(err) {
        if (!err) {
            return;
        }

        if (err.message === 'unexpected server response (429)') {
            throw new Error(
            'You are connecting too fast and are being throttled! Make sure you subscribe to multiple books on one connection.'
            );
        }

        this.emit('error', err);
    }

    subscribe() {
        const message = {
            type: "subscribe",
            product_ids:this.productIDs,
            channels: this.channels,

        }
        this.socket.send(JSON.stringify(message))
    }
}

module.exports = exports = Coinbase