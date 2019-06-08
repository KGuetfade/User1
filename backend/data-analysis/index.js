const Database = require('../src/database')
const coinbaseModel = require('../src/models/coinbasepro')

const start = async () => {
    await Database.connect()
    
    const data = await coinbaseModel.find({})

    const highest = data.sort((a,b) => {
        if (a.percentage > b.percentage) { return -1 }
        else if (a.percentage < b.percentage) { return 1 }
        else { return 0 }
    }).slice()

    const time = data.sort((a,b) => {
        if (a.time > b.time) { return 1 }
        else if (a.time < b.time) { return -1 }
        else { return 0 }
    })

    for (let i = 0; i < 20; i++) {
        console.log(`Percentage: ${highest[i].percentage}`)
        console.log(`Duration: ${highest[i].duration}`)
        console.log(`Time: ${highest[i].time}\n`)
    }

    console.log(`Begin time: ${time[0].time}`)
    console.log(`End time: ${time[time.length - 1].time}`)
    console.log(`Above .75%: ${highest.filter(h => h.percentage > 0.75).length}`)
    console.log(`Accumulate profit percentage: ${highest.filter(h => h.percentage > 0.75)
                                                        .reduce((acc, h) => {
                                                            return acc + (h.percentage - .75)
                                                        }, 0)}`)
}

start()