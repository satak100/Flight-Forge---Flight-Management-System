const jwt = require('jsonwebtoken');
const air_scaling = 1000000;

module.exports = function (req, res, next) {
  const token = req.body.token;

  if (!token) {
    return res.status(405).json("Authorization Denied");
  }

  try {
    console.log(token);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.body.id = decoded.user.id;
    next();
  } catch (err) {
    return res.status(406).json("Not Authorized");
  }
};
