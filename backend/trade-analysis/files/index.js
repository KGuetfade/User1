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
            let str = String.fromCharCode.apply(null, new Uint16Array(value))
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
    const profitCanvas = $("#profit")
    const currencies = ['EUR', 'BTC', 'ETH']
    const profitChart = new Chart(profitCanvas, {
        type: 'bar',
        data: {
            labels: currencies,
            datasets: [{
                label: 'profit per fee tier',
                data: currencies.map(c => getProfit(c, data))
            }]
        }
    })
}

const getProfit = (currency, data) => {
    const profit = data.reduce((acc, d) => {
        return acc + d.net[currency]
    })

    return profit
}