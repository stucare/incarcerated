const axios = require('axios');
const _ = require('lodash');

const { User } = require('../models/user');
const logger = require('../server/logger/logger');

exports = module.exports = function (io) {
    io.on('connection', async (socket) => {

        let handshake = socket.handshake;

        let userId = handshake.query.userId;
        let user = await User.findById(userId);

        socket.on('log', function (data) {
            console.log(data);
        });

        socket.on('join', function (room) {
            socket.join(room);
        });

        socket.on('leave', function (room) {
            socket.leave(room);
        });

        socket.on('sasRequest', async function (sasRequest) {
            try {
                let roomCode = sasRequest.roomCode;

                // get auth token for request
                let tokens = _.filter(user.tokens, { access: 'auth' });
                let authToken = _.last(tokens);

                let response;

                switch (sasRequest.action) {
                    case "select":
                        response = await axios({
                            method: "get",
                            headers: { 'x-auth': authToken.token },
                            url: "/api/sas/" + roomCode,
                            proxy: {
                                port: process.env.PORT

                            }
                        });

                        io.in(roomCode).emit('refreshRoomData', { apiResponse: response.data });
                        break;

                    case "start":
                    case "stop":
                    case "win":
                    case "loss":
                    case "reset":
                        response = await axios({
                            method: "patch",
                            headers: { 'x-auth': authToken.token },
                            url: "/api/sas/" + roomCode + "/" + sasRequest.action,
                            proxy: {
                                port: process.env.PORT

                            }
                        });

                        io.in(roomCode).emit('refreshRoomData', { apiResponse: response.data });
                        break;

                    default:
                        break;
                }

            } catch (error) {
                //todo error log
                console.log(error)
            }
        });
    });
}
