const HttpError = require('./constructor');
const _ = require('lodash');

class BadRequest extends HttpError {
    constructor(message, data) {
        const opts = {
            code: 400,
            message: 'Bad Request'
        };
        if(_.isString(message)) {
            opts.message = message;
        }
        if(_.isObject(data)) {
            opts.details = data;
        }
        super(opts);
    }
}

module.exports = BadRequest;
