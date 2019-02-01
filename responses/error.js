const { HttpError } = require('../errors');
const log = require('logger');

module.exports = function (data) {
    log.error(data);
    const error = HttpError.constructor.toHttpError(data);
    const content = error.getContent();
    const res = this;
    res.status(content.code);
    return res.json(content);
};
