const { encode, decode } = require('./')

encode({
  payload: { some: 'json' },
  encoding: 'gzip' // default
})
.then(buf => decode(buf))
// send buf
// ..
// receive buf
.then(buf => console.log(JSON.parse(buf)))
// { some: 'json' }
