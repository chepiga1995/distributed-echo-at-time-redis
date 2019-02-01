const _ = require('lodash');
const { HttpError } = require('errors');
const LIVR = require('modules/Livr');

module.exports.policyConstructor = function (rules, extraRules = []) {
    const validator = new LIVR.Validator(rules);
    _.each(extraRules, (rule) => {
        validator.registerRules(rule);
    });
    return (rawData) => {
        const validData = validator.validate(rawData);
        if(validData) {
            return validData;
        }
        throw new HttpError.BadRequest('VALIDATION_FAILED', validator.getErrors());
    };
};
