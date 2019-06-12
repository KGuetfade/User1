let data = ""

fetch('http://localhost:3000/data')
    /* .then(response => {
        const reader = response.body.getReader()
        reader.read()
              .then(({ done, value }) => {
                    data = data.concat(value)

                    if (done) {
                        data = JSON.stringify(data)
                        console.log(data)
                    }
              })
    }) */
    .then(res => console.log(res.body))