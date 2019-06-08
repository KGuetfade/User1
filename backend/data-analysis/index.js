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

    console.log(`Accumulative profit percentage: ${highest.filter(h => h.percentage > 0.75)
                                                        .reduce((acc, h) => {
                                                            return acc + (h.percentage - .75)
                                                        }, 0)}`)
    console.log(`Max profit potential: ${highest.filter(h => h.percentage > 0.75)
                                                .reduce((acc, h) => {
                                                    const firstStep = h.steps[0]
                                                    const euro = firstStep.type === 'buy' ? BigNumber(firstStep.funds) :
                                                                                            BigNumber(firstStep.size).times(6934.85)
                                                    const gainPercentage = h.percentage - .75
                                                    const profit = euro * gainPercentage
                                                    if (euro.isGreaterThan(10)) { return acc + profit } else { return acc }
                                                }, 0)}`)     
    console.log(`Max funds needed: ${highest.filter(h => h.percentage > 0.75)
                                            .sort((a,b) => {
                                                const firstStepA = a.steps[0]
                                                const firstStepB = b.steps[0]

                                                const eurA = firstStepA.type === 'buy' ? BigNumber(firstStepA.funds) :
                                                                                         BigNumber(firstStepA.size).times(6934.85)
                                                const eurB = firstStepB.type === 'buy' ? BigNumber(firstStepB.funds) :
                                                                                         BigNumber(firstStepB.size).times(6934.85)

                                                if (eurA.isGreaterThan(eurB)) { return -1 }
                                                else if (eurB.isGreaterThan(eurA)) { return 1 }
                                                else { return 0 }

                                            })[0]}`)                                                                                                   
}

start()