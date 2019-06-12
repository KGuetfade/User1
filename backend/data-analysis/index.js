const Database = require('../src/database')
const ArbitrageModel = require('../src/models/arbitrage')
const express = require('express')

express()
    .use(express.static('files'))
    .get('/', (req, res, next) => res.sendFile('index.html'))
    .get('/data', (req, res, next) => {
        ArbitrageModel.find({}).stream().pipe(res.pipe)
    })
    .listen(3000)

Database.connect() 

