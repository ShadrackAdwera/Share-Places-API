const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const HttpError = require('../models/http-error');
const User = require('../models/user');

const getAllUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, '-password').exec();
  } catch (error) {
    const err = new HttpError('Something went wrong, try again', 500);
    return next(err);
  }
  res
    .status(200)
    .json({ users: users.map((user) => user.toObject({ getters: true })) });
};

const getUserById = (req, res, next) => {
  const userId = req.params.userId;
  const user = USERS.find((u) => {
    return u.id === userId;
  });
  res.status(200).json({ user });
};

const signUp = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(
      new HttpError(
        'Failed! Make sure all values are provided, including the image',
        400
      )
    );
  }
  const { username, email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (error) {
    const err = new HttpError('An error occurred, try again', 500);
    return next(err);
  }

  if (existingUser) {
    const error = new HttpError('User exists, try logging in', 422);
    return next(error);
  }

  let hashedPassword;
  try {
    hashedPassword = bcrypt.hash(password, 12);
  } catch (error) {
    const err = new HttpError('Could not create user', 500);
    return next(err);
  }

  const createdUser = new User({
    username,
    email,
    password: hashedPassword,
    image: req.file.path,
    places: [],
  });

  try {
    await createdUser.save();
  } catch (error) {
    const err = new HttpError('Sign up failed, try again', 422);
    return next(err);
  }

  let token;

  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      'likon_deez_nuts',
      { expiresIn: 900 }
    );
  } catch (error) {
    const err = new HttpError('Sign up failed, try again', 422);
    return next(err);
  }

  res.status(201).json({ userId: createdUser.id, email: createdUser.email, token: token });
};

const logIn = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (error) {
    const err = new HttpError('Login failed, try again', 500);
    return next(err);
  }

  if (!existingUser) {
    return next(new HttpError('Invalid credentials', 401));
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (error) {
    const err = new HttpError('Login Failed, try again', 500);
    return next(err);
  }

  if (!isValidPassword) {
    return next(new HttpError('Invalid credentials', 401));
  }

  let token

  try {
    jwt.sign({userId: existingUser.id, email: existingUser.email}, 'likon_deez_nuts', {expiresIn: 900})
  } catch (error) {
    const err = new HttpError('Login failed, try again', 500);
    return next(err);
  }

  res
    .status(201)
    .json({
      userId: existingUser.id,
      email: existingUser.email,
      token: token
    });
};

exports.getAllUsers = getAllUsers;
exports.getUserById = getUserById;
exports.signUp = signUp;
exports.logIn = logIn;
