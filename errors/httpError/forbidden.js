const HttpError = require('./constructor');
const _ = require('lodash');

class Forbidden extends HttpError {
    constructor(message, data) {
        const opts = {
            code: 403,
            message: 'Forbidden',
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

module.exports = Forbidden;
