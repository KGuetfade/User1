const program = require('commander')
const Server = require('./src/server')

program.version('0.0.1')
    .option('-s, --server', 'Whether to run with express server')
    .parse(process.argv)

const main = async () => {
    const { server } = program
    
    if (server) { Server.start() }
}

main()