const btcprice = 7503.77
const fees = [.75, .6, .54, .45, .3, .24, .21, .18, .15]
const volumeIntervals = [100, 200, 500, 750, 1000, 2000, 5000, 10000, 20000]

fetch('http://localhost:3000/data')
    .then(async response => {
        const reader = response.body.getReader()
        let finished = false
        let data = ""

        while(!finished) {
            const { done, value } = await reader.read()
            let str = String.fromCharCode.apply(null, new Uint16Array(value))
            data = data.concat(str)
            if (done) { finished = true }
        }
        
        return JSON.parse(data)
    })
    .then(data => {
        $('#spinner').css('display', 'none')
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

    
}

const getProfitAbovePercentage = (percentage, data) => {
    const above = data.filter(d => d.percentage >= percentage)
    const profit = above.reduce((acc, d) => {
        const step = d.steps[0]
        const euro = step.type === 'buy' ? step.funds : step.size * btcprice
        const net_percentage = d.percentage - percentage
        
        if (euro <= 15) { return acc }

        const profit = (net_percentage / 100) * euro
        return acc + profit
    }, 0)
    return profit
}

const getTotalVolumeAbovePercentage = (percentage, data) => {
    const above = data.filter(d => d.percentage >= percentage)
    const volume = above.reduce((acc, d) => {
        const step = d.steps[0]
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