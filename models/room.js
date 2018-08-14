const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

const logger = require('./../server/logger/logger');

let RoomSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        minlength: 2
    },
    state: {
        type: String,
        required: true,
        default: 'ready'
    },
    timeBase: {
        type: Number,
        required: false,
        default: 0
    },
    timeRemain: {
        type: Number,
        required: true,
        default: (60*60*1000)
    },
    timeElapsed: {
        type: Number,
        required: true,
        default: 0
    },
    messages: [{
        message: {
            type: String,
        },
        isSilent: {
            type: Boolean,
            required: true,
            default: true
        },
        created: {
            type: Number,
            required: true,
            default: new Date().getTime()
        },
        createdBy: {
            type: String,
            required: true
        }
    }],
    display: {
        name: {
            type: String,
            required: true,
            unique: true
        },
        description: {
            type: String,
            required: true
        },
        isAccessible: {
            type: Boolean,
            required: true,
            default: false
        },
        minPlayers: {
            type: Number,
            required: true,
            default: 2
        },
        maxPlayers: {
            type: Number,
            required: true,
            default: 6
        }
    },
    isLive: {
        type: Boolean,
        required: true,
        default: true
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

RoomSchema.methods.addMessage = function (message) {
    let room = this;
  
    room.messages = room.messages.concat([message]);
  
    return room.save().then(() => {
      return Promise.resolve(_.filter(room.messages, m => m.created === message.created)[0]);
    }).catch((err) => {
      return Promise.reject();
    });
  };

let Room = mongoose.model('Room', RoomSchema);

module.exports = { Room };
