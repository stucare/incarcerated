const mongoose = require('mongoose');

let MaintenanceSchema = new mongoose.Schema({
    active: {
        type: Boolean,
        required: true,
        default: false
    }
})

let Maintenance = mongoose.model('Maintenance', MaintenanceSchema);

module.exports = { Maintenance };
