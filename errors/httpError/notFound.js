const HttpError = require('./constructor');
const _ = require('lodash');

class NotFound extends HttpError {
    constructor(message, data) {
        const opts = {
            code: 404,
            message: 'Not Found',
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

module.exports = NotFound;

