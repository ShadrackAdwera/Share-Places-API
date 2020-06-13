const uuid = require('uuid/v4');
const HttpError = require('../models/http-error');

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
    id:'u1',  
    username: 'Matafaka',
    email: 'matafaka@mail.com',
    password: 'matafaka',
  },
  {
    id:'u2',  
    username: 'Matafaka',
    email: 'matafaka@mail.com',
    password: 'matafaka',
  },
];

const getAllUsers = (req, res, next) => {
  res.status(200).json({ users: USERS });
};

const getUserById = (req, res, next) => {
  const userId = req.params.userId;
  const user = USERS.find((u) => {
    return u.id === userId;
  });
  res.status(200).json({ user });
};

const allUsersInSystem = (req, res, next) => {
  res.status(200).json({ users: SYSTEM_USERS });
};

const signUp = (req, res, next) => {
  const { username, email, password } = req.body;
  const existingEmail = SYSTEM_USERS.find(u=>{
      return u.email === email
  })
  if(existingEmail) {
      throw new HttpError('Email Exists',422) 
  }
  const createdUser = {
    id: uuid(),
    username,
    email,
    password,
  };
  SYSTEM_USERS.push(createdUser);
  res.status(201).json({ newUser: createdUser });
};

const logIn = ((req,res,next)=>{
    const {email,password} = req.body
    const foundEmail = SYSTEM_USERS.find(u=>{
        return u.email===email
    })

    if(!foundEmail || foundEmail.password!==password) {
        throw new HttpError('Authentication failed', 401)
    }
    res.status(201).json({message: 'Successfully logged in'})
})

exports.getAllUsers = getAllUsers;
exports.getUserById = getUserById;
exports.signUp = signUp;
exports.allUsersInSystem = allUsersInSystem;
exports.logIn = logIn
