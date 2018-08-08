const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

const logger = require('./../server/logger/logger');

let AttemptSchema = new mongoose.Schema({
    teamname: {
        type: String,
        required: true,
        unique: true,
    },
    game: {
        room: {
            type: String,
            required: true,
        },
        time: {
            type: Number,
            required: true,
            default: new Date().getTime()
        },
        didEscape: {
            type: Boolean,
            required: true,
            default: false
        },
        host: {
            type: String,
            required: true,
        },
    },
    created: {
        type: Number,
        required: true,
        default: new Date().getTime()
    },
    updated: {
        type: Number,
        required: true,
        default: new Date().getTime()
    }
})

let Attempt = mongoose.model('Room', AttemptSchema);

module.exports = { Attempt };
