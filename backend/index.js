const program = require('commander')
const Server = require('./src/server')
const database = require('./src/database')
const coinbaseModel = require('./src/models/coinbasepro')

const { CoinbaseProSimpleTriArb } = require('./src/triangular-arbitrage')

program.version('0.0.1')
    .option('-s, --server', 'Whether to run with express server')
    .parse(process.argv)

const main = async () => {
    const { server } = program
    
    if (server) { Server.start() }
    
    await database.connect() 

    const coinbasepro = new CoinbaseProSimpleTriArb()
    const result = await coinbasepro.start()
    coinbasepro.print(result)
    
    /* const data = await coinbaseModel.find({})
    const sorted = data.sort((a,b) => {
        if (a.percentage > b.percentage) { return -1 }
        else if (a.percentage < b.percentage) { return 1 }
        else { return 0 }
    })

    console.log(sorted[0])
    console.log(sorted[1])
    console.log(sorted[sorted.length - 1]) */

    /* const coinbasepro = new CoinbaseProSimpleTriArb()
    setInterval(async () => {
        const arb = await coinbasepro.start()
        if (arb) {
            arb.forEach(async a => {
                try {                
                    await coinbaseModel.create(a)                
                } catch (error) { console.log(error) }            
            })
        }        
    }, 12000) */
}

main()