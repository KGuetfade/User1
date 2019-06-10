const program = require('commander')
const Server = require('./src/server')
const Trader = require('./src/trader')
const Database = require('./src/database')

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

program.version('0.0.1')
    .option('-s, --server', 'Whether to run with express server')
    .parse(process.argv)

const main = async () => {
    const { server } = program
    
    await Database.connect()

    if (server) { Server.start() }

    let trader = new Trader({ products: ['BTC-EUR', 'ETH-EUR', 'ETH-BTC'] })
    trader.start()

    /* setInterval(async () => {
        trader.stop()
        await timeout(1000 * 10)
        console.log(`Restarting socket connection`)
        trader.start()
    }, 1000 * 60 * 10) */
}

try {
    main()
} catch(error) { console.log(error) }