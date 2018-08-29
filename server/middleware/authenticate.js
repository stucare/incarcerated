const _ = require('lodash');

let { User } = require('./../../models/user');
let { errorlog } = require('./../logger/logger');
let { createResponse } = require('./../../services/response');

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
                res.status(500).send(
                    createResponse(false, true, "unexpected error", {}, undefined, err)
                );
            });
        } else {
            user.removeExpiredTokens().then((result) => {
                return Promise.reject();
            }).catch((err) => {
                res.status(500).send(
                    createResponse(false, true, "unexpected error", {}, undefined, err)
                );
            });
        }

    }).catch((err) => {
        errorlog(req, res, `Unable to authenticate user with ip: ${req.ip}`, err);
        res.status(403).send(
            createResponse(false, true, "unauthenticated", {}, undefined, err)
        );
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
        errorlog(req, res, `Unable to authenticate user with ip: ${req.ip}`, err);
        res.status(403).redirect('/admin/login');
    });
};

var getAuthenticatedUser = async (req) => {
    try {
        let token = req.header('x-auth') === undefined ? req.cookies.token : req.header('x-auth');

        if(token === undefined){
            return null;
        }

        var user = await User.findByToken(token, 'auth')

        if (!user || !user.isActive) {
            return null
        }

        let currentToken = _.filter(user.tokens, t => t.token === token)[0];

        if (currentToken.expired > new Date().getTime()) {
            let result = await user.removeExpiredTokens()
            if (result) {
                req.user = user;
                req.token = token;
                return user
            }
            return null;
        } else {
            let result = await user.removeExpiredTokens()
            return null;
        }
    } catch (error) {
        throw error;
    }
};

module.exports = { authenticate, adminAuthenticate, getAuthenticatedUser }
