const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const config = require('../configuration')

module.exports = {
    start: () => {
        const app = express();

        const port = config.get('PORT')        
        
        //enhance app security with helmet
        app.use(helmet());
        
        //use bodyParses to parse application/json content-type
        app.use(bodyParser.urlencoded({ extended: false }))
        app.use(bodyParser.json());
        
        //enable all CORS requests (request from different url)
        app.use(cors());
        
        //logs all request to server
        app.use(morgan('combined'));
        
        app.use((err, req, res, next) => {
            console.log(err);
            next();
        });
        
        app.listen(port, () => console.log(`Server running on port ${port}`))
    }
}