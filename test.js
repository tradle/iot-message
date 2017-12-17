const co = require('co')
const test = require('tape')
const { encode, decode } = require('./')

test('encode/decode', wrap(function* (t) {
  const payload = {
    some: 'thing'
  }

  const encoded = yield encode({ payload })
  t.same(encoded, yield encode({
    payload: new Buffer(JSON.stringify(payload))
  }))

  t.same(encoded, yield encode({
    payload: JSON.stringify(payload)
  }))

  t.equal(Buffer.isBuffer(encoded), true)
  const decoded = yield decode(encoded)
  t.same(JSON.parse(decoded), payload)
  t.same(decoded, yield decode(encoded.toString('base64')))
  t.end()
}))

function wrap (gen) {
  return co.wrap(function* (...args) {
    try {
      return yield co.wrap(gen).apply(this, args)
    } catch (err) {
      console.error(err)
      throw err
    }
  })
}
