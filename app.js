require('app-module-path').addPath(__dirname);
const express = require('express');
const config = require('config');
const morgan = require('morgan');
const _ = require('lodash');
const log = require('logger');
const { APP_VERSION } = require('variables');
const router = require('./routers');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { HttpError } = require('errors');
const cronTasks = require('services/cron');
const responses = require('./responses');

const app = express();
const server = require('http').Server(app);

app.set('view engine', 'ejs');
app.set('views', './views');
app.locals.config = config;
app.locals.version = APP_VERSION;

// Morgan
app.use((req, res, next) => {
    morgan('dev')(req, res, next);
});

// Static
app.use(express.static('public'));

// Responses
app.use((req, res, next) => {
    _.extend(res, responses);
    next();
});

// Parsers
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ extended: true, limit: 1024 * 1024 }));
app.use(cookieParser());


// Routers
router(app);

// 404
app.use((req, res) => {
    if(_.startsWith(req.originalUrl, '/api/')) {
        return res.error(new HttpError.NotFound('REQUESTED_METHOD_NOT_FOUND'));
    }
    return res.errorView(new HttpError.NotFound('REQUESTED_PAGE_NOT_FOUND'));
});

// 500
app.use((err, req, res, next) => {
    log.error(err);
    if(err instanceof HttpError.constructor) {
        return res.error(err);
    }
    return res.error(new HttpError.ServerError('UNKNOWN_SERVER_ERROR'));
});

server.listen(config.get('port'), () => {
    log.info('--------------------------------------------');
    log.info(`Environment: ${config.util.getEnv('NODE_ENV')}`);
    log.info(`Port: ${config.get('port')}`);
    log.info('--------------------------------------------');
    global.IS_TERMINATED = false;
    process.on('SIGTERM', termination('SIGTERM'));
    process.on('SIGINT', termination('SIGINT'));
    if(config.util.getEnv('NODE_ENV') !== 'test') {
        _.each(cronTasks, task => task());
    }
});

function termination(event) {
    return () => {
        global.IS_TERMINATED = true;
        log.info(`Server termination by signal: ${event}!!!`);
    };
}

process.on('uncaughtException', (error) => {
    log.error('UNCAUGHT_EXCEPTION', error);
});

module.exports = app;
