const log = require('logger');
const _ = require('lodash');
const { promiseImmediate } = require('./helper');
const redis = require('modules/Redis').getConnection();
const { ECHO_CHUNK_SIZE, ECHO_SORTED_SET_REDIS_KEY } = require('variables');

const delayBetweenCalls = 20; // ms

module.exports.start = async function start() {
    try {
        const processAmount = await collectTasks();
        if(processAmount > 0) {
            log.info(`${new Date().toISOString()} ::: Saved echo ${processAmount}`);
        }
    } catch (e) {
        log.error(e);
    }
    setTimeout(start, delayBetweenCalls);
};


async function collectTasks(processAmount = 0) {
    if(global.IS_TERMINATED) {
        return processAmount;
    }
    let echoToSave = global.ECHO_SAVE_QUEUE.splice(0, ECHO_CHUNK_SIZE);
    echoToSave = _.filter(echoToSave, echo => !echo.is_timeout);
    if(_.isEmpty(echoToSave)) {
        return processAmount;
    }
    const scoreMessageArr = [];
    _.each(echoToSave, (echo) => {
        echo.is_sending = true;
        scoreMessageArr.push(echo.score, echo.message);
    });
    try {
        await redis.zadd(ECHO_SORTED_SET_REDIS_KEY, ...scoreMessageArr);
        _.each(echoToSave, echo => echo.onSend());
        processAmount += echoToSave.length;
    } catch (error) {
        log.warn(error);
        _.each(echoToSave, echo => echo.onFailed());
    }
    return promiseImmediate(collectTasks, processAmount);
}
