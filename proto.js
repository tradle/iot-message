module.exports = require('protocol-buffers')(`
  enum ContentEncoding {
    gzip = 1;
    compress = 2;
    deflate = 3;
    identity = 4;
    br = 5;
  }

  message Headers {
    required string version = 1;
    required ContentEncoding contentEncoding = 2;
  }

  message Message {
    required Headers headers = 1;
    required bytes body = 2;
  }
`)
