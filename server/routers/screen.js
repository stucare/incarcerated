const _ = require('lodash');

const logger = require('./../logger/logger');
const cryptography = require('./../../services/cryptography');
const moment = require('moment');

const { ObjectID } = require('mongodb');
let { mongoose } = require('./../db/mongoose');
let { Room } = require('./../../models/room');
let { User } = require('./../../models/user');
let { createResponse } = require('./../../services/response');

module.exports = (router) => {
    router.get('/:code', async (req, res) => {
        try {
            let roomCode = req.params.code;
            let room = await Room.findOne({ code: roomCode });
            if (!room) {
                return res.status(404).send(
                    createResponse(false, true, "room not found", {}, req.user)
                );
            }

            let user = await User.findOne({username: 'screen'});

            if (!user) {
                throw new Error('unable to find user');
            }

            res.render('screen', {
                layout: false,
                title: 'Screen',
                user: user,
                roomCode: room.code
            });

        } catch (error) {
            res.render('error', {
                layout: false,
                title: 'Error'
            });
        }
    });
}
