const ArbitrageModel = require('../models/arbitrage')

class DataCollector {
    constructor() {
        this.previousTen = []
    }
    
    /**
     * Takes in data of calculated arbitrage opportunity.
     * Save's it to database, if it's percentage hasn't occured within
     * the last 10 percentage changes.
     */
    collect(data) {
        const { percentage } = data

        for (let i = 0; i < this.previousTen.length; i++) {
            const per = this.previousTen[i]
            if (per.isEqualTo(percentage)) { return }
        }

        if (this.previousTen.length < 10) {
            this.previousTen.push(percentage)  
        } else {
            this.previousTen = this.previousTen.slice(1)
            this.previousTen.push(percentage)
        }
        
        this.saveToDatabase(data)
    }

    /**
     * Save's arbitrage opportunity data to database.
     */
    saveToDatabase(data) {
        data.time = new Date()
        ArbitrageModel.create(data, err => {
            if (err) { console.log(err) }
        })
    }
}

module.exports = exports = DataCollector