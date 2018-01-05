const co = require('co')
const promisify = require('pify')
const zlib = promisify(require('zlib'))
const { version } = require('./package.json')
const {
  Headers,
  MessageType,
  Message,
  ContentEncoding
} = require('./proto')

const encode = co.wrap(function* ({ type='messages', payload, encoding='gzip' }) {
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
    type: MessageType[type],
    headers: {
      version,
      contentEncoding: ContentEncoding[encoding],
      date: Date.now()
    },
    body: payload
  })
})

const decodeRaw = payload => {
  if (typeof payload === 'string') {
    payload = new Buffer(payload, 'base64')
  }

  return Message.decode(payload)
}

const getBody = co.wrap(function* (decoded) {
  const { headers, body } = decoded
  if (headers.contentEncoding === ContentEncoding.gzip) {
    return yield zlib.gunzip(body)
  }

  return body
})

const decode = payload => getBody(decodeRaw(payload))

module.exports = {
  encode,
  decode,
  decodeRaw,
  getBody,
  version
}
