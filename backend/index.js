const Server = require('./src/server')
const config = require('./src/configuration')

const port = config.get('PORT')

Server.listen(port, () => console.log(`Server running on port ${port}`))