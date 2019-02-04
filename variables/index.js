module.exports = {
    MAX_STANDARD_STRING_FIELD_LENGTH: 255,
    ECHO_SORTED_SET_REDIS_THREADS: 2, // depends on size of redis cluster. Require migration for decreasing amount
    SERVERS_PER_REDIS_THREAD: 2, // depends on server and redis performance, servers update strategy, servers amount
    ECHO_CHUNK_SIZE: 20, // depends on message size
    MAX_ECHO_RESPONSE_TIME: 40, // ms
    ECHO_SORTED_SET_REDIS_KEY: 'ECHO-AT-TIME',
    SERVER_HEALTH_CHECK_INTERVAL: 1000 * 2, // 2 sec
    ECHO_THREADS_CHECK_INTERVAL: 1000 * 4, // 4 sec
};
