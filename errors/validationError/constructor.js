const _ = require('lodash');
const log = require('logger');

class ValidationError extends Error {
    constructor(opts = {}) {
        super(opts._message);
        this.name = 'VALIDATION_ERROR';
        this.message = opts._message;
        this.code = opts._code;
        this.details = _.omit(opts, ['_code', '_message']);
        if(typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, this.constructor);
        } else {
            this.stack = (new Error(opts.message)).stack;
        }
        this.log();
    }
    log() {
        const logObj = {
            name: this.name,
            code: this.code,
            message: this.message,
            stack: String(this.stack).split('\n'),
        };
        if(!_.isEmpty(this.details)) {
            logObj.details = this.details;
        }
        log.error(JSON.stringify(logObj, null, '\t'));
    }
}

module.exports = ValidationError;
