let data = ""

fetch('http://localhost:3000/data')
    .then(response => {
        const reader = response.body.getReader()
        reader.read()
              .then(({ done, value }) => {
                    let v = String.fromCharCode.apply(null, new Uint16Array(value))
                    data = data.concat(v)
                    if (done) {console.log('done');console.log(data)}
              })
    })