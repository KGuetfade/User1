const program = require('commander')
const App = require('./src/app')
const Database = require('./src/database')
const memwatch = require('node-memwatch')

const CoinbasePro = require('coinbase-pro')

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

    memwatch.on('leak', info => console.log(info))
}

try {
    main()
} catch(error) { console.log(error) }

/* const publicClient = new CoinbasePro.PublicClient();

publicClient
  .getProducts()
  .then(data => {
    console.log(data)
  })
  .catch(error => {
    console.log(error)
  }); */