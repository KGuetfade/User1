const Database = require('../src/database')
const coinbaseModel = require('../src/models/coinbasepro')
const BigNumber = require('bignumber.js')

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

    console.log(`20 highest percentages`)
    for (let i = 0; i < 20; i++) {
        console.log(`Percentage: ${highest[i].percentage}`)
        console.log(`Duration: ${highest[i].duration}`)
        console.log(`Time: ${highest[i].time}\n`)
    }

    console.log('\n----------------------------------\n')

    console.log(`Begin time: ${time[0].time}`)
    console.log(`End time: ${time[time.length - 1].time}\n`)
    console.log(`Above 1%: ${highest.filter(h => h.percentage > 1).length}`)
    console.log(`Above .75%: ${highest.filter(h => h.percentage > 0.75).length}`)
    console.log(`Above .5%: ${highest.filter(h => h.percentage > 0.5).length}`)
    console.log(`Above .3%: ${highest.filter(h => h.percentage > 0.3).length}\n`)

    const per = .75
    const filter = highest.filter(h => h.percentage > per)

    console.log(`Accumulative profit percentage: ${filter.reduce((acc, h) => {
                                                    return acc + (h.percentage - per)
                                                }, 0)}`)
    console.log(`Max profit potential: ${filter.reduce((acc, h) => {
                                            const firstStep = h.steps[0]
                                            const euro = firstStep.type === 'buy' ? BigNumber(firstStep.funds) :
                                                                                    BigNumber(firstStep.size).times(6982.99)
                                            const gainPercentage = BigNumber(h.percentage).minus(per).dividedBy(100)
                                            const profit = euro * gainPercentage
                                            if (euro.isGreaterThan(10)) { return acc + profit } else { return acc }
                                        }, 0)}`)     
    console.log(`Max funds needed: ${filter.map(h => {
                                        const firstStep = h.steps[0]
                                        const euro = firstStep.type === 'buy' ? BigNumber(firstStep.funds) :
                                                                                BigNumber(firstStep.size).times(6982.99)
                                        return euro
                                    })
                                    .sort((a,b) => {
                                        if (a.isGreaterThan(b)) { return -1 }
                                        else if (b.isGreaterThan(a)) { return 1 }
                                        else { return 0 }
                                    })[0] * 3}`)
    const totalVolume = filter.reduce((acc, h) => {
                                const firstStep = h.steps[0]
                                const euro = firstStep.type === 'buy' ? BigNumber(firstStep.funds) :
                                                                        BigNumber(firstStep.size).times(6982.99)
                                return acc + euro * 3
                            }, 0)
    console.log(`Total volume: ${totalVolume}`)         
    console.log(`Average volume: ${totalVolume / filter.length / 3}`)                                                                                           
}

start()