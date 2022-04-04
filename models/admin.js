const { ObjectId } = require('mongoose');
const  mongoose = require('mongoose');
const adminSchema = mongoose.Schema({
    account: String,
    passwordHash: String,
    fullName: String,
    dob: String,
    tenantId: ObjectId,
    createdAt: {
        type: Date,
        default: Date.now
    },
    deleted:{
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date,
        default: null
    }
});

const adminModel = mongoose.model('Admin', adminSchema);
module.exports = adminModel;