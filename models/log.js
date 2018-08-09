const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');


let LogSchema = new mongoose.Schema({
    path: {
        type: String,
        required: true
    },
    method: {
        type: String
    },
    status: {
        type: Number
    },
    message: {
        type: String
    },
    error: {
        type: String
    },
    environment: {
        type: String
    },
    created: {
        type: Number,
        required: true,
        default: new Date().getTime()
    },
    createdBy: {
        type: String
    }
})

let Log = mongoose.model('Log', LogSchema);

module.exports = { Log };
