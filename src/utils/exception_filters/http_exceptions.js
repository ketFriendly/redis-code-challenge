const httpStatusCodes = require("./http_exception_codes");

function NotFoundException(message) {
  this.message = message;
  this.name = "Not Found";
  this.code = httpStatusCodes.NOT_FOUND;
}

function UnprocessableEntityException(message) {
  this.message = message;
  this.name = "Unprocessable Entity";
  this.code = httpStatusCodes.BAD_REQUEST;
}

function InternalServerException(message) {
  this.message = message;
  this.name = "Unprocessable Entity";
  this.code = httpStatusCodes.INTERNAL_SERVER;
}

module.exports = {
  NotFoundException,
  UnprocessableEntityException,
  InternalServerException
};
