const uuid = require('uuid');
const { ValidationError } = require('errors');
const { MAX_ECHO_RESPONSE_TIME } = require('variables');

if(!global.ECHO_SAVE_QUEUE) {
    global.ECHO_SAVE_QUEUE = []; // TODO: move to Linked list
}

module.exports.echoAtTime = async function (echoData) {
    // TODO: consider low diff between send_date and now
    const savePromise = new Promise((resolve, reject) => {
        const queueObj = {
            score: echoData.echo_date.valueOf(),
            message: `${uuid.v4()}${echoData.echo_message}`,
            is_sending: false,
            is_timeout: false,
            onTimeout() {
                if(queueObj.is_sending !== true) {
                    queueObj.is_timeout = true;
                    reject(new ValidationError.General('FAILED_TO_SAVE_ECHO_TO_REDIS'));
                }
            },
            onSend() {
                clearTimeout(queueObj.timeout);
                resolve();
            },
            onFailed() {
                clearTimeout(queueObj.timeout);
                reject(new ValidationError.General('FAILED_TO_SAVE_ECHO_TO_REDIS'));
            },
        };
        queueObj.timeout = setTimeout(queueObj.onTimeout, MAX_ECHO_RESPONSE_TIME);
        global.ECHO_SAVE_QUEUE.push(queueObj);
    });
    await savePromise;
};
