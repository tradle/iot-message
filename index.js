const co = require('co')
const promisify = require('pify')
const zlib = promisify(require('zlib'))
const { version } = require('./package.json')
const protobuf = require('./proto')
const {
  Headers,
  MessageType,
  Message,
  ContentEncoding
} = protobuf

const encode = co.wrap(function* ({ type='messages', encoding='gzip', payload }) {
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
    type: typeof type === 'number' ? type : MessageType[type],
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

const keyByValue = (obj, value) => {
  for (let key in obj) {
    let candidate = obj[key]
    if (candidate === value) return key
  }
}

const getBody = co.wrap(function* (decoded) {
  const { headers, body } = decoded
  if (headers.contentEncoding === ContentEncoding.gzip) {
    return yield zlib.gunzip(body)
  }

  return body
})

const decode = co.wrap(function* (payload, opts={}) {
  const decoded = decodeRaw(payload)
  if (opts.decodeBody !== false) {
    decoded.body = yield getBody(decoded)
  }

  decoded.type = keyByValue(MessageType, decoded.type)
  const enc = decoded.headers.contentEncoding
  if (enc) {
    decoded.headers.contentEncoding = keyByValue(ContentEncoding, enc)
  }

  return decoded
})

module.exports = {
  encode,
  decode,
  decodeRaw,
  getBody,
  version,
  protobuf
}
