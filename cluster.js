require('app-module-path').addPath(__dirname);
const cluster = require('cluster');
const _ = require('lodash');
const numCPUs = require('os').cpus().length;
const log = require('logger');
const uuid = require('uuid');
const { SERVER_HEALTH_CHECK_INTERVAL } = require('variables');
const redis = require('modules/Redis').getConnection();

let activeProcesses = 0;

process.argv.forEach((val, index, array) => {
    const nextArg = _.toNumber(array[index + 1]);
    if(val === '-i' && _.isInteger(nextArg)) {
        activeProcesses = nextArg;
    }
});

activeProcesses = activeProcesses || numCPUs;

if(cluster.isMaster) {
    log.info(`Staring ${activeProcesses} threads`);
    for (let i = 0; i < activeProcesses; i += 1) {
        cluster.fork();
    }

    cluster.on('exit', (deadWorker, code, signal) => {
        // Log the event
        log.warn(`Worker ${deadWorker.id} died. Code: ${code} Signal: ${signal}`);
    });
    process.on('SIGTERM', termination('SIGTERM'));
    process.on('SIGINT', termination('SIGINT'));
} else {
    log.info(`Running ${cluster.worker.id}`);
    if(!global.SERVER_ID) {
        global.SERVER_ID = uuid.v1();
    }
    setInterval(() => {
        redis
            .serverHealthCheck(global.SERVER_ID, SERVER_HEALTH_CHECK_INTERVAL);
    }, SERVER_HEALTH_CHECK_INTERVAL);
    require('./app');
}

function termination(event) {
    return () => {
        global.IS_TERMINATED = true;
        log.warn(`Server termination by signal: ${event}!!!`);
        _.each(cluster.workers, worker => worker.kill());
    };
}
