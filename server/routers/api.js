const _ = require('lodash');

const logger = require('./../logger/logger');
const cryptography = require('./../../services/cryptography');

const { ObjectID } = require('mongodb');
let { mongoose } = require('./../db/mongoose');
let { User } = require('./../../models/user');
let { Room } = require('./../../models/room');
let { Chat } = require('./../../models/chat');
let { Maintenance } = require('./../../models/maintenance');
let { authenticate } = require('./../middleware/authenticate');

module.exports = (router) => {
    router.use(authenticate, (req, res, next) => {
        next();
    });

    // router.all('/users', authenticate, (req, res, next) => {
    //   next();
    // });

    //! MAINTENANCE
    router.get('/maintenance', async (req, res) => {
        try {
            let maintenance = await Maintenance.findOne({});
            res.send({ maintenance })
        } catch (error) {
            logger.errorlog(req, res, "Unknown Error", error);
            res.status(400).send();
        }
    });

    router.patch('/maintenance', async (req, res) => {
        try {
            if (!req.user.isSuperuser) {
                return res.status(403).send();
            }

            let data = _.pick(req.body, ['active']);
            let status = await Maintenance.findOne({});

            if (!status) {
                return res.status(404).send();
            }

            status.active = data.active;
            let maintenance = await status.save();

            res.send({ maintenance });

        } catch (error) {
            logger.errorlog(req, res, "Unknown Error", error);
            res.status(400).send();
        }
    });

    //! USERS
    router.get('/users', async (req, res) => {
        try {
            let users = await User.find({});
            res.send({ users });

        } catch (error) {
            logger.errorlog(req, res, "Unknown Error", error);
            res.status(400).send();
        }
    });

    router.get('/users/active', async (req, res) => {
        try {
            let users = await User.find({ isActive: true });
            res.send({ users });

        } catch (error) {
            logger.errorlog(req, res, "Unknown Error", error);
            res.status(400).send();
        }
    });

    router.get('/users/:id', async (req, res) => {
        try {
            let id = req.params.id;

            if (!ObjectID.isValid(id)) {
                return res.status(400).send();
            }

            let user = await User.findById(id);

            if (!user) {
                return res.status(404).send();
            }

            res.send({ user })

        } catch (error) {
            logger.errorlog(req, res, "Unknown Error", error);
            res.status(400).send();
        }
    });

    router.post('/users', async (req, res) => {
        try {
            if (!req.user.hasRole("canManageUsers")) {
                return res.status(403).send();
            }

            let data = _.pick(req.body, ['username', 'firstName', 'lastName', 'password']);

            let newUser = new User({
                username: data.username,
                password: data.password,
                firstName: data.firstName,
                lastName: data.lastName,
            });

            let user = await newUser.save();

            res.send({ user });

        } catch (error) {
            logger.errorlog(req, res, "Unknown Error", error);
            res.status(400).send();
        }
    });

    router.patch('/users/:id', async (req, res) => {
        try {
            if (!req.user.hasRole("canManageUsers")) {
                return res.status(403).send();
            }

            let id = req.params.id;

            if (!ObjectID.isValid(id)) {
                return res.status(400).send();
            }

            let data = _.pick(req.body, [
                'username',
                'firstName',
                'lastName'
            ]);

            data.updated = new Date().getTime();

            let user = await User.findById(id);

            if (!user) {
                return res.status(404).send();
            }

            user.username = data.username === undefined ? user.username : data.username;
            user.firstName = data.firstName === undefined ? user.firstName : data.firstName;
            user.lastName = data.lastName === undefined ? user.lastName : data.lastName;
            user.password = data.password === undefined ? user.password : data.password;
            user.updated = data.updated;

            await user.save();

            res.send({ user });

        } catch (error) {
            logger.errorlog(req, res, "Unknown Error", error);
            res.status(400).send();
        }
    });

    router.delete('/users/:id', async (req, res) => {
        try {
            if (!req.user.hasRole("canDeleteUsers")) {
                return res.status(403).send();
            }

            let id = req.params.id;

            if (!ObjectID.isValid(id)) {
                return res.status(400).send();
            }

            let user = User.findByIdAndRemove(id);

            if (!user) {
                return res.status(404).send();
            }

            res.send({ user })

        } catch (error) {
            logger.errorlog(req, res, "Unknown Error", error);
            res.status(400).send();
        }
    });

    router.patch('/users/:id/active', async (req, res) => {
        try {
            if (!req.user.hasRole("canManageUsers")) {
                return res.status(403).send();
            }

            let id = req.params.id;
            if (!ObjectID.isValid(id)) {
                return res.status(400).send();
            }

            let user = await User.findById(id);
            if (!user) {
                return res.status(404).send();
            }

            let data = _.pick(req.body, ['isActive']);
            user.isActive = data.isActive;

            let updatedUser = await user.save();
            res.send({ updatedUser });

        } catch (error) {
            logger.errorlog(req, res, "Unknown Error", error);
            res.status(400).send();
        }
    });

    router.patch('/users/:id/su', async (req, res) => {
        try {
            if (!req.user.isSuperuser) {
                return res.status(403).send();
            }

            let id = req.params.id;
            if (!ObjectID.isValid(id)) {
                return res.status(400).send();
            }

            let user = await User.findById(id);
            if (!user) {
                return res.status(404).send();
            }

            let data = _.pick(req.body, ['isSuperuser']);
            user.isSuperuser = data.isSuperuser;

            let updatedUser = await user.save();
            res.send({ updatedUser });

        } catch (error) {
            logger.errorlog(req, res, "Unknown Error", error);
            res.status(400).send();
        }
    });

    //! USER ROLES
    router.get('/users/:id/roles', async (req, res) => {
        try {
            if (!req.user.hasRole("canManageRoles")) {
                return res.status(403).send();
            }

            let id = req.params.id;
            if (!ObjectID.isValid(id)) {
                return res.status(400).send();
            }

            let user = await User.findById(id);
            if (!user) {
                return res.status(404).send();
            }

            res.send(user.roles);

        } catch (error) {
            logger.errorlog(req, res, "Unknown Error", error);
            res.status(400).send();
        }
    });

    router.post('/users/:id/roles', async (req, res) => {
        try {
            if (!req.user.hasRole("canManageRoles")) {
                return res.status(403).send();
            }

            let id = req.params.id;
            if (!ObjectID.isValid(id)) {
                return res.status(400).send();
            }

            let user = await User.findById(id);
            if (!user) {
                return res.status(404).send();
            }

            let data = _.pick(req.body, ['role', 'description']);

            if (_.filter(user.roles, r => r.role === data.role).length === 0) {
                let addedRole = await user.addRole({
                    role: data.role,
                    description: data.description
                })

                res.send({ role });

            } else {
                let existingRoles = _.filter(user.roles, r => r.role === data.role)
                res.status(400).send(existingRoles[0]);

            }

        } catch (error) {
            logger.errorlog(req, res, "Unknown Error", error);
            res.status(400).send();
        }
    });

    router.delete('/users/:id/roles', async (req, res) => {
        try {
            if (!req.user.hasRole("canManageRoles")) {
                return res.status(403).send();
            }

            let id = req.params.id;
            if (!ObjectID.isValid(id)) {
                return res.status(400).send();
            }

            let user = await User.findById(id);
            if (!user) {
                return res.status(404).send();
            }

            let data = _.pick(req.body, ['role']);
            let removedRole = await user.removeRole(data.role);
            res.send({ removedRole })

        } catch (error) {
            logger.errorlog(req, res, "Unknown Error", error);
            res.status(400).send();
        }
    });

    //! CHAT
    router.get('/chat', async (req, res) => {
        try {
            res.status(501).send();
        } catch (error) {
            logger.errorlog(req, res, "Unknown Error", error);
            res.status(400).send();
        }
    });

    router.post('/chat', async (req, res) => {
        try {
            res.status(501).send();
        } catch (error) {
            logger.errorlog(req, res, "Unknown Error", error);
            res.status(400).send();
        }
    });

    //! ATTEMPTS
    router.get('/attempts', async (req, res) => {
        try {
            res.status(501).send();
        } catch (error) {
            logger.errorlog(req, res, "Unknown Error", error);
            res.status(400).send();
        }
    });

    router.get('/attempts/:id', async (req, res) => {
        try {
            res.status(501).send();
        } catch (error) {
            logger.errorlog(req, res, "Unknown Error", error);
            res.status(400).send();
        }
    });

    router.get('/attempts/filtered/:by', async (req, res) => {
        try {
            res.status(501).send();
        } catch (error) {
            logger.errorlog(req, res, "Unknown Error", error);
            res.status(400).send();
        }
    });

    router.post('/attempts', async (req, res) => {
        try {
            res.status(501).send();
        } catch (error) {
            logger.errorlog(req, res, "Unknown Error", error);
            res.status(400).send();
        }
    });

    router.patch('/attempts/:id', async (req, res) => {
        try {
            res.status(501).send();
        } catch (error) {
            logger.errorlog(req, res, "Unknown Error", error);
            res.status(400).send();
        }
    })

    router.delete('/attempts/:id', async (req, res) => {
        try {
            res.status(501).send();
        } catch (error) {
            logger.errorlog(req, res, "Unknown Error", error);
            res.status(400).send();
        }
    })

    //! ROOMS
    router.get('/rooms', async (req, res) => {
        try {
            res.status(501).send();
        } catch (error) {
            logger.errorlog(req, res, "Unknown Error", error);
            res.status(400).send();
        }
    });

    router.get('/rooms/:id', async (req, res) => {
        try {
            res.status(501).send();
        } catch (error) {
            logger.errorlog(req, res, "Unknown Error", error);
            res.status(400).send();
        }
    });

    router.post('/rooms', async (req, res) => {
        try {
            res.status(501).send();
        } catch (error) {
            logger.errorlog(req, res, "Unknown Error", error);
            res.status(400).send();
        }
    });

    router.patch('/rooms/:id', async (req, res) => {
        try {
            res.status(501).send();
        } catch (error) {
            logger.errorlog(req, res, "Unknown Error", error);
            res.status(400).send();
        }
    });

    router.delete('/rooms/:id', async (req, res) => {
        try {
            res.status(501).send();
        } catch (error) {
            logger.errorlog(req, res, "Unknown Error", error);
            res.status(400).send();
        }
    });
}
