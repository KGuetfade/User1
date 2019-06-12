const program = require('commander')
const App = require('./src/app')
const Database = require('./src/database')

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

program.version('0.0.1')
    .option('-d, --data', 'Collect data')
    .option('-t, --trade', 'Trading mode')
    .parse(process.argv)

const main = async () => {
    await Database.connect()

    const { data, trade } = program
    const products = ['BTC-EUR', 'ETH-EUR', 'ETH-BTC']

    const app = new App(products, data, trade)
    app.start()
}

try {
    main()
} catch(error) { console.log(error) }