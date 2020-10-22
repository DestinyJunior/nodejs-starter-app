const router = require('express').Router();

const {
  getTransactions,
  createTransaction
} = require('../../../app/controllers/transactionController');


const { protect, authorize } = require('../../../app/middlewares/auth');

// protect all routes here
router.use(protect);
// router.use(authorize('admin'));

router.get('/', authorize('admin'), getTransactions);

router.post('/', authorize('admin','user'), createTransaction);


module.exports = router;
