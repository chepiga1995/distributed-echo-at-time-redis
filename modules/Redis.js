const config = require('config');
const Redis = require('ioredis');


const serverHealthCheckCommand = `
    local serverId = KEYS[1];
    local delay = KEYS[2]
    redis.call('set', 'APP:HEALTH-CHECK:SERVER:' .. serverId, 'TICK', 'PX', delay)
    redis.call('sadd', 'APP:HEALTH-CHECK:SERVERS', serverId)
`;

const getHealthyServersAmountCommand = `
    local delay = KEYS[1]
    if redis.call('set', 'APP:HEALTH-CHECK:CHECK', 'TICK', 'NX', 'PX', delay * 4) then
        for i, serverId in ipairs(redis.call('smembers', 'APP:HEALTH-CHECK:SERVERS')) do
            if not redis.call('get', 'APP:HEALTH-CHECK:SERVER:' .. serverId) then
                redis.call('srem', 'APP:HEALTH-CHECK:SERVERS', serverId)
            end
        end
    end
    return redis.call('scard', 'APP:HEALTH-CHECK:SERVERS')
`;

// use separate redis server for scripts call
const getThreadsWithLowestLoadCommand = `
    local serverId = KEYS[1]
    local threads = KEYS[2]
    local delay = KEYS[3]
    local reserveThreadsAmount = KEYS[4]
    if redis.call('set', 'APP:ECHO-THREADS:CHECK', 'TICK', 'NX', 'PX', delay * 4) then
        for i=1,threads do
            for j, serverId in ipairs(redis.call('smembers', 'APP:ECHO-THREADS' .. i .. ':SERVERS')) do
                if not redis.call('get', 'APP:HEALTH-CHECK:SERVER:' .. serverId) then
                    redis.call('srem', 'APP:ECHO-THREADS' .. i .. ':SERVERS', serverId);
                end
            end
        end
    end
    local threadsServersAmount = {};
    for i=1,threads do
        redis.call('srem', 'APP:ECHO-THREADS' .. i .. ':SERVERS', serverId);
        local amount = redis.call('scard', 'APP:ECHO-THREADS' .. i .. ':SERVERS');
        table.insert(threadsServersAmount, { amount = amount, thread = i });
    end
    table.sort(threadsServersAmount, function(a,b) return a.amount < b.amount end);
    local reserveThreads = {};
    for i=1,reserveThreadsAmount do
        table.insert(reserveThreads, threadsServersAmount[i].thread);
    end
    for j, i in ipairs(reserveThreads) do
        redis.call('sadd', 'APP:ECHO-THREADS' .. i .. ':SERVERS', serverId)
    end
    return reserveThreads
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
function serverHealthCheck(redis) {
    redis.defineCommand('_serverHealthCheck', {
        numberOfKeys: 2,
        lua: serverHealthCheckCommand,
    });
    return (serverId, delay) => {
        return redis._serverHealthCheck(serverId, delay);
    };
}

function getHealthyServersAmount(redis) {
    redis.defineCommand('_getHealthyServersAmount', {
        numberOfKeys: 1,
        lua: getHealthyServersAmountCommand,
    });
    return (delay) => {
        return redis._getHealthyServersAmount(delay);
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

function getThreadsWithLowestLoad(redis) {
    redis.defineCommand('_getThreadsWithLowestLoad', {
        numberOfKeys: 4,
        lua: getThreadsWithLowestLoadCommand,
    });
    return (serverId, threads, delay, reserveThreadsAmount) => {
        return redis._getThreadsWithLowestLoad(serverId, threads, delay, reserveThreadsAmount);
    };
}

function getConnection() {
    const redis = new Redis(config.get('redis'));
    redis.serverHealthCheck = serverHealthCheck(redis);
    redis.getHealthyServersAmount = getHealthyServersAmount(redis);
    redis.getMessageFromSortedSet = getMessageFromSortedSet(redis);
    redis.getThreadsWithLowestLoad = getThreadsWithLowestLoad(redis);
    return redis;
}


module.exports = {
    getConnection,
};
