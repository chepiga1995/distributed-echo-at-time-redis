const config = require('config');
const Redis = require('ioredis');


const unitHealthCheckCommand = `
    local serverId = KEYS[1];
    local unitName = KEYS[2]
    local delay = KEYS[3]
    redis.call('set', 'APP:HEALTH_CHECK:' .. unitName  .. ':SERVER:' .. serverId, 'TICK', 'PX', delay)
    redis.call('sadd', 'APP:HEALTH_CHECK:' .. unitName  .. ':SERVERS', serverId)
`;

const getHealthUnitCommand = `
    local unitName = KEYS[1]
    for i, serverId in ipairs(redis.call('smembers', 'APP:HEALTH_CHECK:' .. unitName  .. ':SERVERS')) do
        if not redis.call('get', 'APP:HEALTH_CHECK:' .. unitName  .. ':SERVER:' .. serverId) then
            redis.call('srem', 'APP:HEALTH_CHECK:' .. unitName  .. ':SERVERS', serverId)
        end
    end
    return redis.call('scard', 'APP:HEALTH_CHECK:' .. unitName  .. ':SERVERS')
`;

const getMessageFromSortedSetCommand = `
    local key = KEYS[1]
    local to = KEYS[2]
    local limit = KEYS[3]
    local messages = redis.call('ZRANGEBYSCORE', key, 0, to, 'LIMIT', 0, limit)
    if next(messages) then
        redis.call('ZREM', key, unpack(messages))
    end
    return messages
`;
//
function unitHealthCheck(redis) {
    redis.defineCommand('_unitHealthCheck', {
        numberOfKeys: 3,
        lua: unitHealthCheckCommand,
    });
    return (serverId, unitName, delay) => {
        return redis._unitHealthCheck(serverId, unitName, delay);
    };
}

function getHealthUnit(redis) {
    redis.defineCommand('_getHealthUnit', {
        numberOfKeys: 1,
        lua: getHealthUnitCommand,
    });
    return (unitName) => {
        return redis._getHealthUnit(unitName);
    };
}

function getMessageFromSortedSet(redis) {
    redis.defineCommand('_getMessageFromSortedSet', {
        numberOfKeys: 3,
        lua: getMessageFromSortedSetCommand,
    });
    return (key, to, limit) => {
        return redis._getMessageFromSortedSet(key, to, limit);
    };
}

function getConnection() {
    const redis = new Redis(config.get('redis'));
    redis.unitHealthCheck = unitHealthCheck(redis);
    redis.getHealthUnit = getHealthUnit(redis);
    redis.getMessageFromSortedSet = getMessageFromSortedSet(redis);
    return redis;
}


module.exports = {
    getConnection,
};
