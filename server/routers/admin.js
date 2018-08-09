const _ = require('lodash');

const logger = require('./../logger/logger');
const cryptography = require('./../../services/cryptography');

const { ObjectID } = require('mongodb');
let { mongoose } = require('./../db/mongoose');
let { User } = require('./../../models/user');
let { Room } = require('./../../models/room');
let { adminAuthenticate } = require('./../middleware/authenticate');

module.exports = (router) => {
  router.use((req, res, next) => {
    // admin middleware
    next();
  });

  router.get('/', (req, res) => {
    res.redirect('/admin/dashboard');
  });

  router.get('/login', (req, res) => {
    res.render('admin', {
      layout: false,
      title: 'Login',
      template: 'pages/admin.login',
      mainClass: 'login d-flex flex-col align-items-center justify-content-center',
      preAuth: true
    });
  });

  router.post('/login', (req, res) => {
    let data = _.pick(req.body, ['username', 'password'])

    User.findOne({username: data.username}).then((user) => {
      if (!user) {
        res.status(404).send();
      }
      
      if(cryptography.compare(data.password, user.password)) {
        user.generateToken('auth').then((token) => {

          res.cookie('token', token.token, { expires: new Date(token.expired) })
          res.header('x-auth', token.token).send({ user });

          res.status(200).send('/admin/');

        }).catch((err) => {
          logger.errorlog(req, res, "Error generating token", error);
          res.status(500).send();
        });
      } else {
        res.status(401).send();
      }
    }).catch((err) => {
      logger.errorlog(req, res, "Unknown Error", error);
      res.status(400).send();
    });
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
      mainClass: 'dashboard d-flex flex-col flex-wrap align-items-center justify-content-center'
    });
  });

  router.get('/useradmin', adminAuthenticate, (req, res) => {
    res.render('admin', {
      layout: false,
      user: req.user,
      title: 'User Admin',
      template: 'pages/admin.useradmin',
      mainClass: 'useradmin d-flex flex-col flex-wrap align-items-center justify-content-center',
      showHomeLink: true
    });
  });

  router.get('/screens', adminAuthenticate, (req, res) => {
    res.render('admin', {
      layout: false,
      user: req.user,
      title: 'Screen System',
      template: 'pages/admin.screens',
      mainClass: 'screens d-flex flex-col flex-wrap align-items-center justify-content-center',
      showHomeLink: true
    });
  });

  router.get('/leaderboards', adminAuthenticate, (req, res) => {
    res.render('admin', {
      layout: false,
      user: req.user,
      title: 'Manage Leaderboards',
      template: 'pages/admin.leaderboards',
      mainClass: 'leaderboards d-flex flex-col flex-wrap align-items-center justify-content-center',
      showHomeLink: true
    });
  });

  router.get('/vouchers', adminAuthenticate, (req, res) => {
    res.render('admin', {
      layout: false,
      user: req.user,
      title: 'Gift Vouchers',
      template: 'pages/admin.vouchers',
      mainClass: 'vouchers d-flex flex-col flex-wrap align-items-center justify-content-center',
      showHomeLink: true
    });
  });

  router.get('/chat', adminAuthenticate, (req, res) => {
    res.render('admin', {
      layout: false,
      user: req.user,
      title: 'Chat',
      template: 'pages/admin.chat',
      mainClass: 'chat d-flex flex-col flex-wrap align-items-center justify-content-center',
      showHomeLink: true
    });
  });
}
