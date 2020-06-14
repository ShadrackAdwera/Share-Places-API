const { validationResult } = require('express-validator');
const HttpError = require('../models/http-error');
const User = require('../models/user');

const USERS = [
  {
    id: 'u1',
    name: 'Adwesh',
    image:
      'https://images.unsplash.com/photo-1591641079589-be6c042ccdf4?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80',
    places: 3,
  },
  {
    id: 'u2',
    name: 'Deez Nuts',
    image:
      'https://images.unsplash.com/photo-1591641079589-be6c042ccdf4?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80',
    places: 3,
  },
];

const SYSTEM_USERS = [
  {
    id: 'u1',
    username: 'Matafaka',
    email: 'matafaka@mail.com',
    password: 'matafaka',
  },
  {
    id: 'u2',
    username: 'Matafaka',
    email: 'matafaka@mail.com',
    password: 'matafaka',
  },
];

const getAllUsers = async (req, res, next) => {
  const users = await User.find().exec()
  res.status(200).json({users: users.map(user=>user.toObject({getters:true}))})
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
    return next(new HttpError(
      'Failed! Make sure all values are provided, valid email, username and password(minimum of 6 characters)',
      400
    ));
  }
  const { username, email, password, places } = req.body;

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

  const createdUser = new User({
    username,
    email,
    password,
    image:
      'https://images.unsplash.com/photo-1591452713369-20693cd80184?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1900&q=80',
    places,
  });

  try {
    await createdUser.save();
  } catch (error) {
    const err = new HttpError('Task failed, try again', 422);
    return next(err);
  }

  res.status(201).json({ newUser: createdUser.toObject({ getters: true }) });
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

  if(!existingUser || existingUser.password!=password){
    return next(new HttpError('Invalid credentials',401))
  }
  res.status(201).json({ message: 'Successfully logged in' });
};

exports.getAllUsers = getAllUsers;
exports.getUserById = getUserById;
exports.signUp = signUp;
exports.logIn = logIn;
