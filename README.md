
# @tradle/iot-message

## Usage

```js
const { encode, decode } = require('@tradle/iot-message')
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
```
