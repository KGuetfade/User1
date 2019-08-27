const program = require('commander')
const App = require('./src/app')
const Database = require('./src/database')
//const memwatch = require('node-memwatch')

program.version('0.0.1')
    .option('-d, --data [data]', 'Collect data')
    .option('-t, --trade [trade]', 'Trading mode')
    .option('-f, --fee [fee]', 'Fee used for calculations', cmdArgsFloatParser, .8)
    .option('-l, --loss [loss]', 'Maximum loss (%) allowed', cmdArgsFloatParser, .9)
    .parse(process.argv)

const main = async () => {
    await Database.connect()

    const { data, trade, fee, loss } = program

    const products = ['DAI-USDC', 'ETH-USDC', 'ETH-DAI']

    const app = new App(products, data, trade, fee, loss)
    app.start()

    //memwatch.on('leak', info => console.log(info))
}

try {
    main()
} catch(error) { console.log(error) }

function cmdArgsFloatParser(string, defaultValue) {
    var float = parseFloat(string);
  
    if (typeof float == 'number') {
      return float;
    } else {
      return defaultValue;
    }
}