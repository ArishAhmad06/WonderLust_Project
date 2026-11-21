module.exports = class ExpressError extends Error{
// class ExpressError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
};

