const btcprice = 1.00575
const fees = [.8, .75, .6, .54, .45, .3, .24, .21, .18, .15]
const volumeIntervals = [0, 5, 10, 20, 50, 100, 200, 500, 750, 1000, 2000, 5000, 10000, 20000]

const handleLoaded = () => {
    $('#loading').css('display', 'none')
    $('#spinner').css('display', 'none')
    $('#canvases').css('display', 'block')
}

fetch('http://localhost:3000/data')
    .then(async response => {
        const reader = response.body.getReader()
        let finished = false
        let data = ""

        while(!finished) {
            const { done, value } = await reader.read()
            let str;
            try {
                str = String.fromCharCode.apply(null, new Uint16Array(value))
            } catch (err) { 
                alert(err)
            }
            
            data = data.concat(str)
            if (done) { finished = true }
        }
        
        return JSON.parse(data)
    })
    .then(data => {
        handleLoaded()
        createCharts(data)
    })
    .catch(err => console.log(err))

const createCharts = data => {
    const profitBar = $('#profitBar')
    const profitChart = new Chart(profitBar, {
        type: 'bar',
        data: {
            labels: fees,
            datasets: [{
                label: 'profit per fee tier',
                data: fees.map(f => getProfitAbovePercentage(f, data))
            }]
        }
    })

    const volumeBar = $('#volumeBar')
    const volumeChart = new Chart(volumeBar, {
        type: 'bar',
        data: {
            labels: fees,
            datasets: [{
                label: 'volume per fee tier',
                data: fees.map(f => getTotalVolumeAbovePercentage(f, data))
            }]
        }
    })

    const profitVolumeGraph = $('#profitVolumeGraph')
    const profitVolumeChart = new Chart(profitVolumeGraph, {
        type: 'line',
        data : {
            labels: volumeIntervals,
            datasets: [{
                label: 'profit per volume',
                data: volumeIntervals.map(v => ({x: v, y: getProfitPerVolume(fees[0], data, v)}))
            }]            
        }
    })

    const amountGraph = $('#amountGraph')
    const amountChart = new Chart(amountGraph, {
        type: 'bar',
        data : {
            labels: [-100, 0, .3, .5, .75, 1, 1.5, 2, 5, 10],
            datasets: [{
                label: 'amount trades above percentage',
                data: [-100, 0, .3, .5, .75, 1, 1.5, 2, 5, 10].map(p => getCountAbovePercentage(p, data))
            }]            
        }
    })

    const res = data.sort((a,b) => {
        if (a.percentage > b.percentage) { return -1 }
        else if (a.percentage < b.percentage) { return 1 }
        else { return 0 }
    })
    for (let i = 0; i < 10 ;i++) {
        const per = res[i]
        console.log(per)
    }
}

const getProfitAbovePercentage = (percentage, data) => {
    const above = data.filter(d => d.percentage >= percentage)
    const profit = above.reduce((acc, d) => {
        const step = d.steps[0]

        if (!step.funds && !step.size) { return acc }

        const euro = step.type === 'buy' ? step.funds : step.size * btcprice
        const net_percentage = (d.percentage - percentage) / 100
        
        if (euro <= 15) { return acc }

        const profit = net_percentage * euro
        return acc + profit
    }, 0)
    return profit
}

const getTotalVolumeAbovePercentage = (percentage, data) => {
    const above = data.filter(d => d.percentage >= percentage)
    const volume = above.reduce((acc, d) => {
        const step = d.steps[0]

        if (!step.funds && !step.size) { return acc }

        const euro = step.type === 'buy' ? step.funds : step.size * btcprice
        
        if (euro <= 15) { return acc }

        return acc + (euro * 3)
    }, 0)
    return volume
}

const getProfitPerVolume = (percentage, data, volume) => {
    const above = data.filter(d => d.percentage >= percentage)
    const profit = above.reduce((acc, d) => {
        const step = d.steps[0]
        const euro = step.type === 'buy' ? step.funds : step.size * btcprice
        const net_percentage = d.percentage - percentage
        
        if (euro > 15 && euro <= volume) {
            const profit = (net_percentage / 100) * euro
            return acc + profit
        } else { return acc }        
    }, 0)
    return profit
}

const getCountAbovePercentage = (percentage, data) => {
    const above = data.filter(d => d.percentage >= percentage)
    console.log(`amount above ${percentage}: ${above.length}`)
    return above.length
}