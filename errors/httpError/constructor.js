const _ = require('lodash');

class HttpError extends Error {
    constructor(opts) {
        super(opts.message);
        this.name = this.constructor.name;
        this.message = opts.message;
        this.code = opts.code;
        this.details = opts.details;
        if(typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, this.constructor);
        } else {
            this.stack = (new Error(opts.message)).stack;
        }
    }
    getContent() {
        const content = {
            code: this.code,
            message: this.message,
        };
        if(!_.isEmpty(this.details)) {
            content.details = this.details;
        }
        return content;
    }
    static toHttpError(data) {
        const defaultError = {
            code: 500,
            message: 'Server Error',
        };
        if(data instanceof HttpError) {
            return data;
        }
        if(data instanceof Error) {
            defaultError.message = data.message;
            return new HttpError(defaultError);
        }
        if(_.isString(data)) {
            defaultError.message = data;
            return new HttpError(defaultError);
        }
        return new HttpError(defaultError);
    }
}

module.exports = HttpError;
