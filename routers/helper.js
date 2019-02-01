const { ValidationError } = require('errors');
const _ = require('lodash');


function defaultResolver(req) {
    return _.pick(req, ['params', 'query', 'body', 'headers']);
}

function jsonResponse(controller, resolver = defaultResolver) {
    if(!_.isFunction(resolver)) {
        throw new ValidationError.General('RESOLVER_MUST_BE_FUNCTION', { resolver });
    }
    return async (req, res) => {
        try {
            const data = resolver(req);
            if(!_.isObject(data)) {
                throw new ValidationError.General('RESOLVER_MUST_RETURN_OBJECT', { data });
            }
            const result = await controller.call(null, data);
            if(!_.isObject(result)) {
                throw new ValidationError.General('MUST_RETURN_OBJECT', { result });
            }
            return res.json(result);
        } catch (error) {
            return res.error(error);
        }
    };
}

function okResponse(controller, resolver = defaultResolver) {
    if(!_.isFunction(resolver)) {
        throw new ValidationError.General('RESOLVER_MUST_BE_FUNCTION', { resolver });
    }
    return async (req, res) => {
        try {
            const data = resolver(req);
            if(!_.isObject(data)) {
                throw new ValidationError.General('RESOLVER_MUST_RETURN_OBJECT', { data });
            }
            await controller.call(null, data);
            return res.ok();
        } catch (error) {
            return res.error(error);
        }
    };
}

function createdResponse(controller, resolver = defaultResolver) {
    if(!_.isFunction(resolver)) {
        throw new ValidationError.General('RESOLVER_MUST_BE_FUNCTION', { resolver });
    }
    return async (req, res) => {
        try {
            const data = resolver(req);
            if(!_.isObject(data)) {
                throw new ValidationError.General('RESOLVER_MUST_RETURN_OBJECT', { data });
            }
            const result = await controller.call(null, data);
            if(!_.isObject(result)) {
                throw new ValidationError.General('MUST_RETURN_OBJECT', { result });
            }
            return res.created(result);
        } catch (error) {
            return res.error(error);
        }
    };
}


module.exports = {
    jsonResponse,
    okResponse,
    createdResponse,
};
