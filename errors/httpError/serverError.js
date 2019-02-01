const HttpError = require('./constructor');
const _ = require('lodash');

class ServerError extends HttpError {
    constructor(message, data) {
        const opts = {
            code: 500,
            message: 'We\'re sorry but something went wrong',
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

module.exports = ServerError;
