const program = require('commander')
const Server = require('./src/server')
const Trader = require('./src/trader')
const Database = require('./src/database')

program.version('0.0.1')
    .option('-s, --server', 'Whether to run with express server')
    .parse(process.argv)

const main = async () => {
    const { server } = program
    
    await Database.connect()

    if (server) { Server.start() }

    const trader = new Trader({ products: ['BTC-EUR', 'ETH-EUR', 'ETH-BTC'] })
    trader.start()


}

try {
    main()
} catch(error) { console.log(error) }
