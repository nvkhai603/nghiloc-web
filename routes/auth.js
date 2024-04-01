const jwt = require("jsonwebtoken");
const auth = {
  require: function (req, res, next) {
    const token =
      req.body.token || req.query.token || req.headers["x-access-token"];

    if (!token) {
      return res.status(403).send("A token is required for authentication");
    }
    try {
      const decoded = jwt.verify(token, process.env.TOKEN_KEY);
      req.admin = decoded;
    } catch (err) {
      return res.status(401).send("Invalid Token");
    }
    return next();
  },

  getTenantId: function(req, res, next){
    // req.reqTenantId = req.headers["x-tenant-id"];
    req.reqTenantId = "623f2814e2bf65460c67547b"
    return next();
  }
};

module.exports = auth;
