const _ = require('lodash');

let createResponse = (wasSuccess, wasAuthentionRequired, responseMessage, responseObject, user, error) => {

    let obj = {
        success: wasSuccess,
        authentication: {
            required: wasAuthentionRequired
        },
        message: responseMessage
    }

    if (wasAuthentionRequired) {
        if (user) {
            obj.authentication.passed = true;
            obj.authentication.user = user.username;

            if (user.isSuperuser) {
                if(error && !_.isEmpty(error)){
                    obj.error = error;
                }
            }
        } else {
            obj.authentication.passed = false;
        }
    }

    if (wasSuccess) {
        obj.return = responseObject;
    } else {
        obj.return = {};
    }

    return obj;
}

module.exports = {
    createResponse
}
