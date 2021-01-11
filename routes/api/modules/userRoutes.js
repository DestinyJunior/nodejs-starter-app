import express from "express";
const router = express.Router();


import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
} from '../../../app/controllers/userController.js';

import { protect, authorize } from '../../../app/middlewares/auth.js'

// protect all routes here
router.use(protect);
router.use(authorize('admin'));


router.post('/', createUser);

router.get('/', getUsers);

router.get('/:id', getUser);

router.put('/:id', updateUser);

router.delete('/:id', deleteUser);


export default router