const fs = require('fs');
const path = require('path');
const moment = require('moment');

const logStream = fs.createWriteStream(path.join(__dirname, 'app.log'), { flags: 'a' });
const time = moment().format('HH:mm:ss (DD.MM.YY)');
function customLogger(message) {
    logStream.write(`${time} ${message}\n`);
}

module.exports = customLogger;