const jwt = require('jsonwebtoken');
const HttpError = require('../models/http-error');

module.exports = (req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next();
  }
  try {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
      throw new Error('Auth failed!');
    }
    const decodedToken = jwt.verify(token, process.env.JWT_KEY);
    next();
    req.userData = { userId: decodedToken.userId };
  } catch (error) {
    const err = new HttpError('Auth Failed', 403);
    return next(err);
  }
};
