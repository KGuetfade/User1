const mongoose = require('mongoose')
const config = require('../configuration')

module.exports = {
    /**
     * Opens a connection with MongoDb database.
     */
    connect: async () => {
        const databaseUrl = config.get('DATABASE_URL')
        if (databaseUrl === "") throw new Error('Please provide database url in config.json')
        try {
            await mongoose.connect(databaseUrl, {
                useNewUrlParser: true, 
                promiseLibrary: global.Promise
            })
            console.log(`database connected at ${databaseUrl}`)
        } catch (error) { console.log(error) }        
    },
    model: key => mongoose.model(key)
}