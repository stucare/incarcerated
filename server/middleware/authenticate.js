const _ = require('lodash');

let { User } = require('./../../models/user');
let { errorlog } = require('./../logger/logger');

var authenticate = (req, res, next) => {
  let token = req.header('x-auth') === undefined ? req.cookies.token : req.header('x-auth');

  User.findByToken(token, 'auth').then((user) => {
    if (!user || !user.isActive) {
      return Promise.reject();
    }

    let currentToken = _.filter(user.tokens, t => t.token === token)[0];

    if (currentToken.expired > new Date().getTime()) {
      user.removeExpiredTokens().then((result) => {
        req.user = user;
        req.token = token;
        next();
      }).catch((err) => {
        res.status(500).send();
      });
    } else {
      user.removeExpiredTokens().then((result) => {
        return Promise.reject();
      }).catch((err) => {
        res.status(500).send();
      });
    }

  }).catch((err) => {
    errorlog(`Unable to authenticate user with ip: ${req.ip}`, err);
    res.status(403).send();
  });
};

var adminAuthenticate = (req, res, next) => {
  let token = req.header('x-auth') === undefined ? req.cookies.token : req.header('x-auth');

  User.findByToken(token, 'auth').then((user) => {
    if (!user || !user.isActive) {
      return Promise.reject();
    }

    let currentToken = _.filter(user.tokens, t => t.token === token)[0];

    if (currentToken.expired > new Date().getTime()) {
      user.removeExpiredTokens().then((result) => {
        req.user = user;
        req.token = token;
        next();
      }).catch((err) => {
        res.status(500).send();
      });
    } else {
      user.removeExpiredTokens().then((result) => {
        return Promise.reject();
      }).catch((err) => {
        res.status(500).send();
      });
    }

  }).catch((err) => {
    errorlog(`Unable to authenticate user with ip: ${req.ip}`, err);
    res.status(403).redirect('/admin/login');
  });
};

module.exports = { authenticate, adminAuthenticate }
