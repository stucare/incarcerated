const fs = require('fs');

let env = process.env.NODE_ENV || 'development';

let serverlog = (req, res, next) => {
  let now = new Date().toUTCString();
  let log = `${now}: (${env.substring(0,3)}) ${res.statusCode} ${req.method} ${req.url}`;
  if (env === 'development') {
    console.log(log);
  }
  fs.appendFile(__dirname + `\\..\\logs\\server.log`, log + '\n', (err) => {
    if (err) {
      errorlog('Unable to add to server.log', err);
    }
  });
  next();
};

let errorlog = (message, err) => {
  let now = new Date().toUTCString();
  let log = `${now} (${env.substring(0,3)}):\n\t${message}\n\t${err}`;
  if (env === 'development') {
    console.log(log);
  }
  fs.appendFile(__dirname + `\\..\\logs\\error.log`, log + '\n', (err) => {
    if (err) {
      console.log('Unable to append to error.log', err);
    }
  });
};

module.exports = { serverlog, errorlog };
