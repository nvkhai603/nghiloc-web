
var router = require('express').Router();
var mongoose = require('mongoose');
var tenantModel = mongoose.model('Tenant');

// Get all tenants
router.get('',function(req, res, next) {
    tenantModel.find(function(err, tenants) {
        if (err) {
            return next(err);
        }
        res.json(tenants);
    });
});

// Insert a new tenant
router.post('', function(req, res, next) {
    var tenant = new tenantModel(req.body);
    tenant.save(function(err, tenant) {
        if (err) {
            return next(err);
        }
        res.json(tenant);
    });
});

module.exports = router;