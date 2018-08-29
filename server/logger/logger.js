const fs = require('fs');
const { Log } = require('./../../models/log');

let env = process.env.NODE_ENV || 'development';

let serverlog = async (req, res, next) => {
    let now = new Date().getTime();

    let userId = req.user === undefined ? req.ip : req.user._id.toString() ;

    let log = new Log({
      path: req.url,
      method: req.method,
      status: res.statusCode,
      environment: env,
      createdBy: userId
    })
       
    let createdLog = await log.save();
    
    if (env === 'development') {
      //console.log(JSON.stringify(createdLog, undefined, 2));
    }

    next();
};

let errorlog = async (req, res, message, err) => {
  let now = new Date().getTime();

  let userId = req.user === undefined ? req.ip : req.user._id.toString() ;

  let log = new Log({
    path: req.url,
    method: req.method,
    status: res.statusCode,
    environment: env,
    createdBy: userId,
    message: message,
    error: err
  })
     
  let createdLog = await log.save();
  
  if (env === 'development') {
    console.log(JSON.stringify(createdLog, undefined, 2));
  }
};

module.exports = { serverlog, errorlog };
