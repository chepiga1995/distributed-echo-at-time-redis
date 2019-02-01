const winston = require('winston');
const cluster = require('cluster');
const config = require('config');

const label = `APP_${cluster.isMaster ? 'MASTER' : cluster.worker.id}`;

const logger = new winston.Logger({
    level: config.get('log.level'),
    transports: [
        new winston.transports.Console({
            colorize: true,
            label,
            silent: config.get('log.silent'),
        }),
    ],
});

module.exports = logger;
