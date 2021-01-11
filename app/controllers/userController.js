/* eslint-disable no-unused-vars */
import asyncHandler from '../middlewares/async.js';
import  User from '../models/User.js';



export const getUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json({'success': true, users: []});
});


export const getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  res.status(200).json({
    success: true,
    data: user
  });
});


export const createUser = asyncHandler(async (req, res, next) => {
  const user = await create(req.body);

  res.status(201).json({
    success: true,
    data: user
  });
});


export const updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: user
  });
});

export const deleteUser = asyncHandler(async (req, res, next) => {
  await User.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    data: {}
  });
});