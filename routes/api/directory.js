var router = require("express").Router();
var mongoose = require("mongoose");
var Directory = mongoose.model("Directory");
var Tenant = mongoose.model("Tenant");
var auth = require("../auth");

// Get directories
router.get("/", async function (req, res, next) {
  const tenantCode = req.headers["x-tenant-code"];
  var tenant = await Tenant.findOne({ code: tenantCode });
  if (!tenant) {
    return res.status(404).send("Tenant not found");
  }

  const directory = await Directory.findOne({ tenantId: tenant._id });
  return res.status(200).json(directory);
});

// Update directories
router.post("/", auth.require, async function (req, res, next) {
  const tenantId = req.admin.tenantId;
  const { rule, result, footer, bannerUrl, webName, webTitle, mainTitle, subTitle } = req.body;
  const tenant = await Tenant.findOne({ _id: tenantId });
  if (!tenant) {
    return res.status(404).send("Tenant not found");
  }
  var directory = await Directory.findOne({ tenantId: tenant._id });
  if (!directory) {
    directory = new Directory();
  }
  directory.tenantId = tenant._id;
  directory.rule = rule;
  directory.result = result;
  directory.footer = footer;
  directory.bannerUrl = bannerUrl;
  directory.webName = webName;
  directory.webTitle = webTitle;
  directory.mainTitle = mainTitle;
  directory.subTitle = subTitle;
  
  await directory.save();
  return res.status(200).json(directory);
});

module.exports = router;
