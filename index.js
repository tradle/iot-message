const co = require('co')
const promisify = require('pify')
const zlib = promisify(require('zlib'))
const { version } = require('./package.json')
const {
  Headers,
  Message,
  ContentEncoding
} = require('./proto')

const encode = co.wrap(function* ({ payload, encoding='gzip' }) {
  if (!(typeof payload === 'string' || Buffer.isBuffer(payload))) {
    payload = JSON.stringify(payload)
  }

  if (!(encoding in ContentEncoding)) {
    throw new Error(`encoding ${encoding} is not supported`)
  }

  switch (encoding) {
    case 'gzip':
      payload = yield zlib.gzip(payload)
      break
    case 'identity':
      break
    default:
      throw new Error(`encoding ${encoding} is not supported`)
  }

  return Message.encode({
    headers: {
      version,
      contentEncoding: ContentEncoding[encoding]
    },
    body: payload
  })
})

const decode = co.wrap(function* (payload) {
  if (typeof payload === 'string') {
    payload = new Buffer(payload, 'base64')
  }

  const { headers, body } = Message.decode(payload)
  if (headers.contentEncoding === ContentEncoding.gzip) {
    return yield zlib.gunzip(body)
  }

  return body
})

module.exports = {
  encode,
  decode,
  version
}
