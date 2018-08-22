const _ = require('lodash');

const logger = require('./../logger/logger');
const cryptography = require('./../../services/cryptography');

const { ObjectID } = require('mongodb');
let { mongoose } = require('./../db/mongoose');
let { User } = require('./../../models/user');
let { Room } = require('./../../models/room');
let { Chat } = require('./../../models/chat');
let { Maintenance } = require('./../../models/maintenance');
let { createResponse } = require('./../../services/response');
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

            res.send(
                createResponse(true, true, "success", { maintenance }, req.user)
            )

        } catch (error) {
            logger.errorlog(req, res, "Unknown Error", error);
            res.status(400).send(
                createResponse(false, true, "bad request", {}, req.user, error)
            );
        }
    });

    router.patch('/maintenance', async (req, res) => {
        try {
            if (!req.user.isSuperuser) {
                return res.status(403).send(
                    createResponse(false, true, "insufficient permissions", {}, req.user)
                );
            }

            let data = _.pick(req.body, ['active']);
            let status = await Maintenance.findOne({});

            if (!status) {
                return res.status(404).send(
                    createResponse(false, true, "status not found", {}, req.user)
                );
            }

            status.active = data.active;
            let maintenance = await status.save();

            res.send(
                createResponse(true, true, "success", { maintenance }, req.user)
            );

        } catch (error) {
            logger.errorlog(req, res, "Unknown Error", error);
            res.status(400).send(
                createResponse(false, true, "bad request", {}, req.user, error)
            );
        }
    });

    //! USERS
    router.get('/users', async (req, res) => {
        try {
            let users = await User.find({});

            res.send(
                createResponse(true, true, "success", { user }, req.user)
            );

        } catch (error) {
            logger.errorlog(req, res, "Unknown Error", error);
            res.status(400).send(
                createResponse(false, true, "bad request", {}, req.user, error)
            );
        }
    });

    router.get('/users/active', async (req, res) => {
        try {
            let users = await User.find({ isActive: true });

            res.send(
                createResponse(true, true, "success", { user }, req.user)
            );

        } catch (error) {
            logger.errorlog(req, res, "Unknown Error", error);
            res.status(400).send(
                createResponse(false, true, "bad request", {}, req.user, error)
            );
        }
    });

    router.get('/users/:id', async (req, res) => {
        try {
            let id = req.params.id;

            if (!ObjectID.isValid(id)) {
                return res.status(400).send(
                    createResponse(false, true, "bad id", {}, req.user)
                );
            }

            let user = await User.findById(id);

            if (!user) {
                return res.status(404).send(
                    createResponse(false, true, "user not found", {}, req.user)
                );
            }

            res.send(
                createResponse(true, true, "success", { user }, req.user)
            );

        } catch (error) {
            logger.errorlog(req, res, "Unknown Error", error);
            res.status(400).send(
                createResponse(false, true, "bad request", {}, req.user, error)
            );
        }
    });

    router.post('/users', async (req, res) => {
        try {
            if (!req.user.hasRole("canManageUsers")) {
                return res.status(403).send(
                    createResponse(false, true, "insufficient permissions", {}, req.user)
                );
            }

            let data = _.pick(req.body, ['username', 'firstName', 'lastName', 'password']);

            let newUser = new User({
                username: data.username,
                password: data.password,
                firstName: data.firstName,
                lastName: data.lastName,
            });

            let user = await newUser.save();

            res.send(
                createResponse(true, true, "success", { user }, req.user)
            );

        } catch (error) {
            logger.errorlog(req, res, "Unknown Error", error);
            res.status(400).send(
                createResponse(false, true, "bad request", {}, req.user, error)
            );
        }
    });

    router.patch('/users/:id', async (req, res) => {
        try {
            if (!req.user.hasRole("canManageUsers")) {
                return res.status(403).send(
                    createResponse(false, true, "insufficient permissions", {}, req.user)
                );
            }

            let id = req.params.id;

            if (!ObjectID.isValid(id)) {
                return res.status(400).send(
                    createResponse(false, true, "bad id", {}, req.user)
                );
            }

            let data = _.pick(req.body, [
                'username',
                'firstName',
                'lastName'
            ]);

            data.updated = new Date().getTime();

            let user = await User.findById(id);

            if (!user) {
                return res.status(404).send(
                    createResponse(false, true, "user not found", {}, req.user)
                );
            }

            user.username = data.username === undefined ? user.username : data.username;
            user.firstName = data.firstName === undefined ? user.firstName : data.firstName;
            user.lastName = data.lastName === undefined ? user.lastName : data.lastName;
            user.password = data.password === undefined ? user.password : data.password;
            user.updated = data.updated;

            await user.save();

            res.send(
                createResponse(true, true, "success", { user }, req.user)
            );

        } catch (error) {
            logger.errorlog(req, res, "Unknown Error", error);
            res.status(400).send(
                createResponse(false, true, "bad request", {}, req.user, error)
            );
        }
    });

    router.delete('/users/:id', async (req, res) => {
        try {
            if (!req.user.hasRole("canDeleteUsers")) {
                return res.status(403).send(
                    createResponse(false, true, "insufficient permissions", {}, req.user)
                );
            }

            let id = req.params.id;

            if (!ObjectID.isValid(id)) {
                return res.status(400).send(
                    createResponse(false, true, "bad id", {}, req.user)
                );
            }

            let user = User.findByIdAndRemove(id);

            if (!user) {
                return res.status(404).send(
                    createResponse(false, true, "user not found", {}, req.user)
                );
            }

            res.send(
                createResponse(true, true, "success", { user }, req.user)
            );

        } catch (error) {
            logger.errorlog(req, res, "Unknown Error", error);
            res.status(400).send(
                createResponse(false, true, "bad request", {}, req.user, error)
            );
        }
    });

    router.patch('/users/:id/active', async (req, res) => {
        try {
            if (!req.user.hasRole("canManageUsers")) {
                return res.status(403).send(
                    createResponse(false, true, "insufficient permissions", {}, req.user)
                );
            }

            let id = req.params.id;
            if (!ObjectID.isValid(id)) {
                return res.status(400).send(
                    createResponse(false, true, "bad id", {}, req.user)
                );
            }

            let user = await User.findById(id);
            if (!user) {
                return res.status(404).send(
                    createResponse(false, true, "user not found", {}, req.user)
                );
            }

            let data = _.pick(req.body, ['isActive']);
            user.isActive = data.isActive;

            let updatedUser = await user.save();

            res.send(
                createResponse(true, true, "success", { user: updatedUser }, req.user)
            );

        } catch (error) {
            logger.errorlog(req, res, "Unknown Error", error);
            res.status(400).send(
                createResponse(false, true, "bad request", {}, req.user, error)
            );
        }
    });

    router.patch('/users/:id/su', async (req, res) => {
        try {
            if (!req.user.isSuperuser) {
                return res.status(403).send(
                    createResponse(false, true, "insufficient permissions", {}, req.user)
                );
            }

            let id = req.params.id;
            if (!ObjectID.isValid(id)) {
                return res.status(400).send(
                    createResponse(false, true, "bad id", {}, req.user)
                );
            }

            let user = await User.findById(id);
            if (!user) {
                return res.status(404).send(
                    createResponse(false, true, "user not found", {}, req.user)
                );
            }

            let data = _.pick(req.body, ['isSuperuser']);
            user.isSuperuser = data.isSuperuser;

            let updatedUser = await user.save();

            res.send(
                createResponse(true, true, "success", { user: updatedUser }, req.user)
            );

        } catch (error) {
            logger.errorlog(req, res, "Unknown Error", error);
            res.status(400).send(
                createResponse(false, true, "bad request", {}, req.user, error)
            );
        }
    });

    //! USER ROLES
    router.get('/users/:id/roles', async (req, res) => {
        try {
            if (!req.user.hasRole("canManageRoles")) {
                return res.status(403).send(
                    createResponse(false, true, "insufficient permissions", {}, req.user)
                );
            }

            let id = req.params.id;
            if (!ObjectID.isValid(id)) {
                return res.status(400).send(
                    createResponse(false, true, "bad id", {}, req.user)
                );
            }

            let user = await User.findById(id);
            if (!user) {
                return res.status(404).send(
                    createResponse(false, true, "user not found", {}, req.user)
                );
            }

            res.send(
                createResponse(true, true, "success", { roles: user.roles }, req.user)
            );

        } catch (error) {
            logger.errorlog(req, res, "Unknown Error", error);
            res.status(400).send(
                createResponse(false, true, "bad request", {}, req.user, error)
            );
        }
    });

    router.post('/users/:id/roles', async (req, res) => {
        try {
            if (!req.user.hasRole("canManageRoles")) {
                return res.status(403).send(
                    createResponse(false, true, "insufficient permissions", {}, req.user)
                );
            }

            let id = req.params.id;
            if (!ObjectID.isValid(id)) {
                return res.status(400).send(
                    createResponse(false, true, "bad id", {}, req.user, error)
                );
            }

            let user = await User.findById(id);
            if (!user) {
                return res.status(404).send(
                    createResponse(false, true, "user not found", {}, req.user)
                );
            }

            let data = _.pick(req.body, ['role', 'description']);

            if (_.filter(user.roles, r => r.role === data.role).length === 0) {
                let addedRole = await user.addRole({
                    role: data.role,
                    description: data.description
                })

                res.send(
                    createResponse(true, true, "success", { role }, req.user)
                );

            } else {
                let existingRoles = _.filter(user.roles, r => r.role === data.role)

                res.status(400).send(
                    createResponse(true, true, "success", { role: existingRoles[0] }, req.user)
                );

            }

        } catch (error) {
            logger.errorlog(req, res, "Unknown Error", error);
            res.status(400).send(
                createResponse(false, true, "bad request", {}, req.user, error)
            );
        }
    });

    router.delete('/users/:id/roles', async (req, res) => {
        try {
            if (!req.user.hasRole("canManageRoles")) {
                return res.status(403).send(
                    createResponse(false, true, "insufficient permissions", {}, req.user)
                );
            }

            let id = req.params.id;
            if (!ObjectID.isValid(id)) {
                return res.status(400).send(
                    createResponse(false, true, "bad id", {}, req.user, error)
                );
            }

            let user = await User.findById(id);
            if (!user) {
                return res.status(404).send(
                    createResponse(false, true, "user not found", {}, req.user)
                );
            }

            let data = _.pick(req.body, ['role']);
            let removedRole = await user.removeRole(data.role);

            res.send(
                createResponse(true, true, "success", { role: removedRole }, req.user)
            );

        } catch (error) {
            logger.errorlog(req, res, "Unknown Error", error);
            res.status(400).send(
                createResponse(false, true, "bad request", {}, req.user, error)
            );
        }
    });

    //! CHAT
    router.get('/chat', async (req, res) => {
        try {
            res.status(501).send(
                createResponse(false, true, "not yet implemented", {}, req.user)
            );
        } catch (error) {
            logger.errorlog(req, res, "Unknown Error", error);
            res.status(400).send(
                createResponse(false, true, "bad request", {}, req.user, error)
            );
        }
    });

    router.post('/chat', async (req, res) => {
        try {
            res.status(501).send(
                createResponse(false, true, "not yet implemented", {}, req.user)
            );
        } catch (error) {
            logger.errorlog(req, res, "Unknown Error", error);
            res.status(400).send(
                createResponse(false, true, "bad request", {}, req.user, error)
            );
        }
    });

    //! ATTEMPTS
    router.get('/attempts', async (req, res) => {
        try {
            res.status(501).send(
                createResponse(false, true, "not yet implemented", {}, req.user)
            );
        } catch (error) {
            logger.errorlog(req, res, "Unknown Error", error);
            res.status(400).send(
                createResponse(false, true, "bad request", {}, req.user, error)
            );
        }
    });

    router.get('/attempts/:id', async (req, res) => {
        try {
            res.status(501).send(
                createResponse(false, true, "not yet implemented", {}, req.user)
            );
        } catch (error) {
            logger.errorlog(req, res, "Unknown Error", error);
            res.status(400).send(
                createResponse(false, true, "bad request", {}, req.user, error)
            );
        }
    });

    router.get('/attempts/filtered/:by', async (req, res) => {
        try {
            res.status(501).send(
                createResponse(false, true, "not yet implemented", {}, req.user)
            );
        } catch (error) {
            logger.errorlog(req, res, "Unknown Error", error);
            res.status(400).send(
                createResponse(false, true, "bad request", {}, req.user, error)
            );
        }
    });

    router.post('/attempts', async (req, res) => {
        try {
            res.status(501).send(
                createResponse(false, true, "not yet implemented", {}, req.user)
            );
        } catch (error) {
            logger.errorlog(req, res, "Unknown Error", error);
            res.status(400).send(
                createResponse(false, true, "bad request", {}, req.user, error)
            );
        }
    });

    router.patch('/attempts/:id', async (req, res) => {
        try {
            res.status(501).send(
                createResponse(false, true, "not yet implemented", {}, req.user)
            );
        } catch (error) {
            logger.errorlog(req, res, "Unknown Error", error);
            res.status(400).send(
                createResponse(false, true, "bad request", {}, req.user, error)
            );
        }
    })

    router.delete('/attempts/:id', async (req, res) => {
        try {
            res.status(501).send(
                createResponse(false, true, "not yet implemented", {}, req.user)
            );
        } catch (error) {
            logger.errorlog(req, res, "Unknown Error", error);
            res.status(400).send(
                createResponse(false, true, "bad request", {}, req.user, error)
            );
        }
    })

    //! ROOMS
    router.get('/rooms', async (req, res) => {
        try {
            let rooms = await Room.find({});

            res.send(
                createResponse(true, true, "success", { rooms }, req.user)
            );

        } catch (error) {
            logger.errorlog(req, res, "Unknown Error", error);
            res.status(400).send(
                createResponse(false, true, "bad request", {}, req.user, error)
            );
        }
    });

    router.get('/rooms/:id', async (req, res) => {
        try {
            let id = req.params.id;
            if (!ObjectID.isValid(id)) {
                return res.status(400).send(
                    createResponse(false, true, "bad id", {}, req.user, error)
                );
            }

            let room = await Room.findById(id);
            if (!room) {
                return res.status(404).send(
                    createResponse(false, true, "room not found", {}, req.user, error)
                );
            }

            res.send(
                createResponse(true, true, "success", { room }, req.user)
            );

        } catch (error) {
            logger.errorlog(req, res, "Unknown Error", error);
            res.status(400).send(
                createResponse(false, true, "bad request", {}, req.user, error)
            );
        }
    });

    router.post('/rooms', async (req, res) => {
        try {
            if (!req.user.hasRole("canDeleteRooms")) {
                return res.status(403).send(
                    createResponse(false, true, "insufficient permissions", {}, req.user)
                );
            }

            let data = _.pick(req.body, ['code', 'name', 'description', 'minPlayers', 'maxPlayers', 'isLive', 'isAccessible']);

            let newRoom = new Room({
                code: data.code,
                display: {
                    name: data.name,
                    description: data.description,
                    minPlayers: data.minPlayers,
                    maxPlayers: data.maxPlayers,
                    isLive: !data.isLive ? false : data.isLive,
                    isAccessible: !data.isAccessible ? false : data.isAccessible
                }
            });

            let room = await newRoom.save();

            res.send(
                createResponse(true, true, "success", { room }, req.user)
            );

        } catch (error) {
            logger.errorlog(req, res, "Unknown Error", error);
            res.status(400).send(
                createResponse(false, true, "bad request", {}, req.user, error)
            );
        }
    });

    router.patch('/rooms/:id', async (req, res) => {
        try {
            let id = req.params.id;
            if (!ObjectID.isValid(id)) {
                return res.status(400).send(
                    createResponse(false, true, "bad id", {}, req.user, error)
                );
            }

            res.status(501).send(
                createResponse(false, true, "not yet implemented", {}, req.user, error)
            );
        } catch (error) {
            logger.errorlog(req, res, "Unknown Error", error);
            res.status(400).send(
                createResponse(false, true, "bad request", {}, req.user, error)
            );
        }
    });

    router.delete('/rooms/:id', async (req, res) => {
        try {
            if (!req.user.hasRole("canDeleteRooms")) {
                return res.status(403).send(
                    createResponse(false, true, "insufficient permissions", {}, req.user)
                );
            }

            let id = req.params.id;
            if (!ObjectID.isValid(id)) {
                return res.status(400).send(
                    createResponse(false, true, "bad id", {}, req.user, error)
                );
            }

            let room = Room.findByIdAndRemove(id);

            if (!room) {
                return res.status(404).send(
                    createResponse(false, true, "room not found", {}, req.user, error)
                );
            }

            res.send(
                createResponse(true, true, "success", { room }, req.user)
            );

        } catch (error) {
            logger.errorlog(req, res, "Unknown Error", error);
            res.status(400).send(
                createResponse(false, true, "bad request", {}, req.user, error)
            );
        }
    });

    //! SCREEN SYSTEM
    router.post('/:code/message', async (req, res) => {
        try {
            let roomCode = req.params.code;

            let room = await Room.findOne({ code: roomCode });
            if (!room) {
                return res.status(404).send(
                    createResponse(false, true, "room not found", {}, req.user)
                );
            }

            let data = _.pick(req.body, ['message', 'isSilent']);

            if (data.message.length === 0) {
                data.isSilent = true;
            }

            let message = await room.addMessage({
                message: data.message,
                isSilent: !data.isSilent ? false : data.isSilent,
                createdBy: req.user._id.toString(),
                created: new Date().getTime()
            })

            res.send(
                createResponse(true, true, "success", { message }, req.user)
            );

        } catch (error) {
            logger.errorlog(req, res, "Unknown Error", error);
            res.status(400).send(
                createResponse(false, true, "bad request", {}, req.user, error)
            );
        }
    });
}
