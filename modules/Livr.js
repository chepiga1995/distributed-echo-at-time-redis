const LIVR = require('livr');
const _ = require('lodash');
const moment = require('moment');


LIVR.Validator.defaultAutoTrim(true);


function toDate() {
    return (value, params, outputArr) => {
        if(value === undefined || value === null || value === '') return null;
        if(_.isDate(value)) return null;
        if(!_.isString(value) || _.isNaN(Date.parse(value))) return 'NOT_VALID_JS_DATE';
        outputArr.push(new Date(value));
        return null;
    };
}

function dateAfterNow() {
    return (value) => {
        if(value === undefined || value === null || value === '') return null;
        if(moment(value).isSameOrAfter(moment())) return null;
        return 'DATE_MUST_BE_AFTER_NOW';
    };
}


LIVR.Validator.registerDefaultRules({ to_date: toDate });
LIVR.Validator.registerDefaultRules({ date_after_now: dateAfterNow });


module.exports = LIVR;
