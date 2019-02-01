const HttpError = require('./constructor');

class Unauthorized extends HttpError {
    constructor() {
        const opts = {
            code: 401,
            message: 'The request requires user authentication.'
        };
        super(opts);
    }
}

module.exports = Unauthorized;
