var router = require("express").Router();
var mongoose = require("mongoose");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
var adminModel = mongoose.model("Admin");
var auth = require("../auth");

// Register admmin
router.post("/register", async function (req, res, next) {
  const { account, password, tenantId } = req.body;
  if (!(account && password && tenantId)) {
    res.status(400).send("All input is required");
  }
  const oldUser = await adminModel.findOne({ account });
  if (oldUser) {
    return res.status(409).send("User Already Exist.");
  }

  const encryptedPassword = await bcrypt.hash(password, 10);

  // Create user in our database
  const admin = await adminModel.create({
    account: account.toLowerCase(),
    tenantId,
    passwordHash: encryptedPassword,
  });
  res.status(201).json(admin);
});

// Login admin
router.post("/login", async function (req, res, next) {
  const { account, password, tenantId } = req.body;
  if (!(account && password && tenantId)) {
    return res.status(400).send("All input is required");
  }
  var admin = await adminModel.findOne({ account, tenantId });
  if (!admin) {
    return res.status(401).send("Invalid Account");
  }
  const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);
  if (!isPasswordValid) {
    return res.status(401).send("Invalid Password");
  }

  // Create token
  const token = jwt.sign(
    { _id: admin._id, account: admin.account, tenantId: tenantId},
    process.env.TOKEN_KEY,
    {
      expiresIn: "12h",
    }
  );

  res.status(200).json({ token });
});

// Get me
router.get("/me", auth.require, async function (req, res, next) {
  console.log(req.admin);
  var admin = await adminModel.findOne({ _id: req.admin._id });
  if (!admin) {
    return res.status(401).send("Invalid Account");
  }

  res
    .status(200)
    .json({ account: admin.account, _id: admin._id, tenantId: admin.tenantId });
});

// Change password
router.post("change-pass", async function (req, res, next) {
  var { oldPass, newPass } = req.body;
  var admin = await adminModel.findOne({ _id: req.admin._id });
  if (!admin) {
    return res.status(400).send("Invalid Account");
  }

  const isPasswordValid = await bcrypt.compare(oldPass, admin.passwordHash);
  if (!isPasswordValid) {
    return res.status(400).send("Invalid Password");
  }

  const encryptedPassword = await bcrypt.hash(newPass, 10);
  admin.passwordHash = encryptedPassword;
  await admin.save();
  return res.status(200).send("Password Changed");
});

module.exports = router;
