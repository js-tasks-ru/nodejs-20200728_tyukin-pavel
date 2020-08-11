class SpecificPathError extends Error {
  constructor() {
    super('Path is nested.');

    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);

    this.code = 'BAD_PATH';
  }
}

module.exports = SpecificPathError;
