const jwt = require('jsonwebtoken');
const HttpError = require('../models/http-error');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
      throw new Error('Auth failed!');
    }
    const decodedToken = jwt.verify(token, 'likon_deez_nuts');
    next();
    req.userData = { userId: decodedToken.userId };
  } catch (error) {
    const error = new HttpError('Auth Failed', 401);
    return next(error);
  }
};
