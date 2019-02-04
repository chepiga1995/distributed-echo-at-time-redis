const { policyConstructor } = require('controllers/helper');
const { MAX_STANDARD_STRING_FIELD_LENGTH } = require('variables');
const service = require('services/EchoService');

const validateEchoAtTime = policyConstructor({
    echo_date: ['to_date', 'date_after_now', 'required'],
    echo_message: ['string', { max_length: MAX_STANDARD_STRING_FIELD_LENGTH }, 'required'],
});

module.exports.echoAtTime = async function ({ body }) {
    const echoData = validateEchoAtTime(body);
    await service.echoAtTime(echoData);
};
