var router = require("express").Router();
var mongoose = require("mongoose");
var Organization = mongoose.model("Organization");
var Tenant = mongoose.model("Tenant");
var auth = require("../auth");

// Get directories
router.get("/", async function (req, res, next) {
  const tenantCode = req.headers["x-tenant-code"];
  var tenant = await Tenant.findOne({ code: tenantCode });
  if (!tenant) {
    return res.status(404).send("Tenant not found");
  }

  const organization = await Organization.findOne({ tenantId: tenant._id });
  return res.status(200).json(organization);
});

// Update directories
router.post("/", auth.require, async function (req, res, next) {
  const tenantId = req.admin.tenantId;
  const { students, teachers } = req.body;
  const tenant = await Tenant.findOne({ _id: tenantId });
  if (!tenant) {
    return res.status(404).send("Tenant not found");
  }
  var organization = await Organization.findOne({ tenantId: tenant._id });
  if (!organization) {
    organization = new Organization();
  }
  organization.tenantId = tenant._id;
  organization.students = students;
  organization.teachers = teachers;
  await organization.save();
  return res.status(200).json(organization);
});

module.exports = router;
