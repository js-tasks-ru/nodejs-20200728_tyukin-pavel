const stream = require('stream');
const os = require('os');

class LineSplitStream extends stream.Transform {
  constructor(options) {
    super(options);

    this.chunkPart = '';
  }

  _transform(chunk, encoding, callback) {
    const tempSum = this.chunkPart + chunk;
    const detach = tempSum.split(os.EOL);
    this.chunkPart = detach.pop();

    detach.forEach((chunk) => {
      this.push(chunk);
    });

    callback(null);
  }

  _flush(callback) {
    callback(null, this.chunkPart);
  }
}

module.exports = LineSplitStream;
