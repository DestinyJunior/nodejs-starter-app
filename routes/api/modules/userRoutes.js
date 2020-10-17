// const mongoose = require('mongoose');
const router = require('express').Router();
// const User = mongoose.model('User');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
} = require('../../../app/controllers/userController');

router.post('/', createUser);

router.get('/', getUsers);

router.get('/:id', getUser);

router.put('/:id', updateUser);

router.delete('/:id', deleteUser);


module.exports = router;