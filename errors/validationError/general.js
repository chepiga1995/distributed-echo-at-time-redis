const ValidationError = require('./constructor');
const _ = require('lodash');

class General extends ValidationError {
    constructor(message, data) {
        const opts = {
            _code: 'GENERAL',
            _message: 'SOMETHING_GOES_WRONG',
        };
        if(_.isString(message)) {
            opts._message = message;
        }
        if(_.isObject(data)) {
            delete data._code;
            delete data._message;
            _.extend(opts, data);
        }
        super(opts);
    }
}

module.exports = General;
