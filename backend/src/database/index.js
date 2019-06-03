const mongoose = require('mongoose')
const config = require('../configuration')

module.exports = {
    connect: async () => {
        const databaseUrl = config.get('DATABASE_URL')
        try {
            await mongoose.connect(`mongodb:${databaseUrl}`, {
                useNewUrlParser: true, 
                promiseLibrary: global.Promise
            })
            console.log(`database connected at ${databaseUrl}`)
        } catch (error) { console.log(error) }        
    },
    model: key => mongoose.model(key)
}