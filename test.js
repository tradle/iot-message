const co = require('co')
const test = require('tape')
const sinon = require('sinon')
const { encode, decode, version } = require('./')

test('encode/decode', wrap(function* (t) {
  const payload = {
    some: 'thing'
  }

  const now = Date.now()
  const stubNow = sinon.stub(Date, 'now').returns(now)

  const encoded = yield encode({ payload })
  const payloadBuf = new Buffer(JSON.stringify(payload))
  t.same(encoded, yield encode({ payload: payloadBuf }))

  t.same(encoded, yield encode({
    payload: JSON.stringify(payload)
  }), 'support string and Buffer payload')

  t.equal(Buffer.isBuffer(encoded), true, 'encoded is Buffer')
  const decoded = yield decode(encoded)
  t.same(decoded, {
    type: 'messages',
    body: payloadBuf,
    headers: {
      contentEncoding: 'gzip',
      date: now,
      version
    }
  }, 'decoded message equals original')

  t.same(decoded, yield decode(encoded.toString('base64')), 'support base64 encoding')

  const encodedIdentity = yield encode({
    payload,
    encoding: 'identity'
  })

  t.notSame(encoded, encodedIdentity)
  t.same(yield decode(encodedIdentity), {
    type: 'messages',
    body: payloadBuf,
    headers: {
      contentEncoding: 'identity',
      date: now,
      version
    }
  })

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
