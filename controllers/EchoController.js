const { policyConstructor } = require('controllers/helper');
const { MAX_STANDARD_STRING_FIELD_LENGTH } = require('variables');
const service = require('services/EchoService');

const validateEchoAtTime = policyConstructor({
    echo_date: ['to_date', 'date_after_now', { default: new Date('2019-09-03 08:54:29.781Z') }, 'required'],
    echo_message: ['string', { max_length: MAX_STANDARD_STRING_FIELD_LENGTH }, { default: 'test' }, 'required'],
});

module.exports.echoAtTime = async function ({ body }) {
    const echoData = validateEchoAtTime(body);
    await service.echoAtTime(echoData);
};
