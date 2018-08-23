const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');
const crypto = require('crypto-js');

const logger = require('./../server/logger/logger');
const cryptography = require('./../services/cryptography')

const secret = process.env.SECRET;

// User: {
//   username,
//   password,
//   firstName,
//   lastName,
//   isActive,
//   isSuperuser,
//   roles: [{
//     role,
//     description,
//     created,
//     updated
//   }],
//   tokens: [{
//     access,
//     token,
//     created,
//     expired
//   }],
//   created,
//   updated
// }

let UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: 3,
        maxlength: 20
    },
    password: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true,
        minlength: 3
    },
    lastName: {
        type: String,
        required: true,
        minlength: 3
    },
    isActive: {
        type: Boolean,
        required: true,
        default: true
    },
    isSuperuser: {
        type: Boolean,
        required: true,
        default: false
    },
    roles: [{
        role: {
            type: String,
            required: true,
            minlength: 3
        },
        description: {
            type: String,
            required: true
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
    }],
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        },
        created: {
            type: Number,
            required: true,
            default: new Date().getTime()
        },
        expired: {
            type: Number,
            required: true,
            default: new Date().getTime() + (11 * 60 * 60 * 1000)
        }
    }],
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
});

UserSchema.methods.toJSON = function () {
    return _.pick(this.toObject(), ['_id', 'username', 'firstName', 'lastName', 'isActive', 'isSuperuser']);
};

UserSchema.methods.generateToken = async function (type) {
    let user = this;
    let access = type;
    let token = jwt.sign({ _id: user._id.toHexString(), access }, secret).toString();

    user.tokens = user.tokens.concat([{ access, token }]);

    try {
        await user.save();
        return Promise.resolve(_.filter(user.tokens, t => t.token === token)[0]);
    } catch (err) {
        return Promise.reject();
    }
};

UserSchema.methods.removeExpiredTokens = async function () {
    let user = this;
    var result = await user.update({
        $pull: {
            tokens: {
                'token.expired': {
                    $lt: new Date().getTime()
                }
            }
        }
    });

    try {
        return Promise.resolve(result);
    } catch (error) {
        return Promise.reject();
    }
}

UserSchema.methods.addRole = async function (role) {
    let user = this;

    user.roles = user.roles.concat([{
        role: role.role,
        description: role.description
    }]);

    try {
        await user.save()
        return Promise.resolve(_.filter(user.roles, r => r.role === role.role)[0]);
    } catch (error) {
        return Promise.reject();
    }
};

UserSchema.methods.hasRole = function (role) {
    if (this.isActive && this.isSuperuser) {
        return true;
    } else {
        return this.isActive && _.filter(this.roles, r => r.role === role).length !== 0
    };
}

UserSchema.methods.removeRole = function (role) {
    let user = this;

    return user.update({
        $pull: {
            roles: { role }
        }
    });
};

UserSchema.statics.findByToken = function (token, type) {
    let decodedToken;

    try {
        decodedToken = jwt.verify(token, secret);
    } catch (err) {
        return Promise.reject();
    }

    return this.findOne({
        '_id': decodedToken._id,
        'tokens.token': token,
        'tokens.access': type
    });
}

UserSchema.pre('save', function (next) {
    if (this.isModified('password')) {
        this.password = cryptography.hash(this.password);
    };

    next();
});

let User = mongoose.model('User', UserSchema);

module.exports = { User };
