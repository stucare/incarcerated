const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

const logger = require('./../server/logger/logger');
const cryptography = require('./../services/cryptography')

const secret = process.env.SECRET;

// Chat: {
//   message,
//   createdBy,
//   created
// }

let ChatSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true
  },
  createdBy: {
    type: String,
    required: true
  },
  created: {
    type: Number,
    required: true,
    default: new Date().getTime()
  },
  user: {
    type: Object
  }
});

let Chat = mongoose.model('Chat', ChatSchema);

module.exports = { Chat };
