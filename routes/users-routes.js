const express = require('express');

const router = express.Router();

const USERS = [
  {
    id: 'u1',
    name: 'Adwesh',
    image:
      'https://images.unsplash.com/photo-1591641079589-be6c042ccdf4?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80',
    places: 3,
  },
];

router.get('/:userId', (req, res, next) => {
  const userId = req.params.userId;
  const user = USERS.find((u) => {
    return u.id === userId;
  });
  res.json({ user });
});

module.exports = router
