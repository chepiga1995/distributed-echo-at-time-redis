const log = require('logger');
const _ = require('lodash');
const redis = require('modules/Redis').getConnection();
const { ECHO_THREADS_CHECK_INTERVAL, SERVER_HEALTH_CHECK_INTERVAL,
    ECHO_SORTED_SET_REDIS_THREADS, SERVERS_PER_REDIS_THREAD } = require('variables');

if(!global.ACTIVE_THREADS) {
    global.ACTIVE_THREADS = _.map(new Array(ECHO_SORTED_SET_REDIS_THREADS), (v, key) => +key + 1);
}

module.exports.start = async function start() {
    try {
        const activeServers = await redis
            .getHealthyServersAmount(SERVER_HEALTH_CHECK_INTERVAL) || 1;
        const amountOfThreads = _.min([_.ceil(
            (ECHO_SORTED_SET_REDIS_THREADS * SERVERS_PER_REDIS_THREAD)
            / activeServers
        ), ECHO_SORTED_SET_REDIS_THREADS]);
        global.ACTIVE_THREADS = await redis.getThreadsWithLowestLoad(
            global.SERVER_ID,
            ECHO_SORTED_SET_REDIS_THREADS,
            ECHO_THREADS_CHECK_INTERVAL,
            amountOfThreads,
        );
    } catch (e) {
        log.error(e);
    }
    setTimeout(start, ECHO_THREADS_CHECK_INTERVAL);
};

