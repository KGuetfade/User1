const ArbitrageModel = require('../models/arbitrage')

class DataCollector {
    constructor() {
        this.previousTen = []
    }
    
    /**
     * Takes in orderbooks. Calulates percentage.
     * If percentage already saved in last ten saves,
     * it will return. Else it will calulate profit and
     * save the data to database.
     */
    process(orderbooks) {
        const { percentage } = data

        for (let i = 0; i < this.previousTen.length; i++) {
            const per = this.previousTen[i]
            if (per.toFixed(9) === percentage.toFixed(9)) { return }
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