const router = require('express').Router();


const { protect, authorize } = require('../../../app/middlewares/auth');

// protect all routes here
router.use(protect);
router.use(authorize('admin'));