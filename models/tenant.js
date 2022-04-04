const  mongoose = require('mongoose');
const tenantSchema = mongoose.Schema({
    name: String,
    code: String
});

const tenantModel = mongoose.model('Tenant', tenantSchema);
module.exports = tenantModel;