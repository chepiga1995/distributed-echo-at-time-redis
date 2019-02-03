const log = require('logger');
const _ = require('lodash');
const { promiseImmediate } = require('./helper');
const redis = require('modules/Redis').getConnection();
const { ECHO_CHUNK_SIZE, ECHO_SORTED_SET_REDIS_KEY } = require('variables');

const delayBetweenCalls = 50; // ms

module.exports.start = async function start() {
    try {
        const processAmount = await collectTasks();
        if(processAmount > 0) {
            log.info(`${new Date().toISOString()} ::: Processed echo ${processAmount}`);
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
    const now = new Date();
    const messages = await redis
        .getMessageFromSortedSet(ECHO_SORTED_SET_REDIS_KEY, now.valueOf(), ECHO_CHUNK_SIZE);
    if(_.isEmpty(messages)) {
        return processAmount;
    }
    processAmount += messages.length;
    logEcho(messages, now);
    if(messages.length < ECHO_CHUNK_SIZE) {
        return processAmount;
    }
    return promiseImmediate(collectTasks, processAmount);
}

function logEcho(messages, now) {
    _.each(messages, message => log.info(`${now.toISOString()}. Message:${message}`));
}

