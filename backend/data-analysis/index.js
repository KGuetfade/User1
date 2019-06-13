const Database = require('../src/database')
const ArbitrageModel = require('../src/models/arbitrage')
const express = require('express')
const JSONStream = require('JSONStream')

express()
    .use(express.static('files'))
    .get('/', (req, res, next) => res.sendFile('index.html'))
    .get('/data', (req, res, next) => {
        ArbitrageModel.find({})
                      .cursor()
                      .pipe(JSONStream.stringify())
                      .pipe(res.type('json'))

    })
    .listen(3000, () => console.log(`Server started on port ${3000}`))

Database.connect() 

