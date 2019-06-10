const program = require('commander')
const App = require('./src/app')
const Database = require('./src/database')

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

program.version('0.0.1')
    .option('-s, --server', 'Whether to run with express server')
    .parse(process.argv)

const main = async () => {
    await Database.connect()
    const app = new App()
    app.start()
}

try {
    main()
} catch(error) { console.log(error) }