module.exports = {
    MAX_STANDARD_STRING_FIELD_LENGTH: 255,
    ECHO_CHUNK_SIZE: 20, // depends on message size
    MAX_ECHO_RESPONSE_TIME: 40, // ms
    ECHO_SORTED_SET_REDIS_KEY: 'echo-at-time',
    SERVER_HEALTH_CHECK_UNIT_NAME: 'SERVER',
    SERVER_HEALTH_CHECK_INTERVAL: 1000 * 2, // 2 sec
};
