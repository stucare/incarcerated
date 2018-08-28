const _ = require('lodash');

const logger = require('./../logger/logger');
const cryptography = require('./../../services/cryptography');

const { ObjectID } = require('mongodb');
let { mongoose } = require('./../db/mongoose');
let { User } = require('./../../models/user');
let { Room } = require('./../../models/room');
let { adminAuthenticate } = require('./../middleware/authenticate');
let { createResponse } = require('./../../services/response');

module.exports = (router) => {
    // router.use((req, res, next) => {
    //     // admin middleware
    //     next();
    // });

    router.get('/', (req, res) => {
        res.redirect('/admin/dashboard');
    });

    router.get('/login', (req, res) => {
        res.render('admin', {
            layout: false,
            title: 'Login',
            template: 'pages/admin.login',
            mainClass: 'login d-flex flex-column align-items-center justify-content-center',
            preAuth: true
        });
    });

    router.post('/login', async (req, res) => {
        try {

            let data = _.pick(req.body, ['username', 'password'])
            let user = await User.findOne({ username: data.username.toLowerCase() });
            if (!user) {
                return res.status(404).send(
                    createResponse(false, false, "user not found", {})
                );
            }

            if (cryptography.compare(data.password, user.password)) {
                let token = await user.generateToken('auth');
                res.header('x-auth', token.token);
                res.cookie('token', token.token, { expires: new Date(token.expired) })

                return res.send(
                    createResponse(true, true, "success", { user }, user)
                );

            } else {
                return res.status(403).send(
                    createResponse(false, false, "bad request", {})
                );
            }

        } catch (error) {
            logger.errorlog(req, res, "Unknown Error", error);
            return res.status(400).send(
                createResponse(false, false, "bad request", {}, undefined, error)
            );
        }
    });

    router.get('/logout', adminAuthenticate, (req, res) => {
        res.clearCookie('token').redirect('/admin/login');
    });

    router.get('/dashboard', adminAuthenticate, (req, res) => {
        res.render('admin', {
            layout: false,
            user: req.user,
            title: 'Dashboard',
            template: 'pages/admin.dashboard',
            mainClass: 'dashboard d-flex flex-column flex-wrap align-items-center justify-content-center'
        });
    });

    router.get('/useradmin', adminAuthenticate, (req, res) => {
        res.render('admin', {
            layout: false,
            user: req.user,
            title: 'User Admin',
            template: 'pages/admin.useradmin',
            mainClass: 'useradmin d-flex flex-column flex-wrap align-items-center justify-content-center',
            showHomeLink: true
        });
    });

    router.get('/screens', adminAuthenticate, async (req, res) => {

        let rooms = await Room.find({isLive: true});

        res.render('admin', {
            layout: false,
            user: req.user,
            title: 'Screen Administration System',
            template: 'pages/admin.screens',
            mainClass: 'screens d-flex flex-column flex-wrap ',
            showHomeLink: true,
            rooms: rooms
        });
    });

    router.get('/leaderboards', adminAuthenticate, (req, res) => {
        res.render('admin', {
            layout: false,
            user: req.user,
            title: 'Manage Leaderboards',
            template: 'pages/admin.leaderboards',
            mainClass: 'leaderboards d-flex flex-column flex-wrap align-items-center justify-content-center',
            showHomeLink: true
        });
    });

    router.get('/vouchers', adminAuthenticate, (req, res) => {
        res.render('admin', {
            layout: false,
            user: req.user,
            title: 'Gift Vouchers',
            template: 'pages/admin.vouchers',
            mainClass: 'vouchers d-flex flex-column flex-wrap align-items-center justify-content-center',
            showHomeLink: true
        });
    });

    router.get('/chat', adminAuthenticate, (req, res) => {
        res.render('admin', {
            layout: false,
            user: req.user,
            title: 'Chat',
            template: 'pages/admin.chat',
            mainClass: 'chat d-flex flex-column flex-wrap align-items-center justify-content-center',
            showHomeLink: true
        });
    });
}
