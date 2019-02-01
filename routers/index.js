const fs = require('fs');
const _ = require('lodash');

const files = fs.readdirSync(__dirname);
const names = _.pull(files, 'index.js', 'helper.js');

module.exports = (app) => {
    _.each(names, name => app.use(require(`./${name}`)));
};
