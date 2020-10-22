// const ErrorResponse = require('../helpers/errorResponse');
const asyncHandler = require('../middlewares/async');
const Transaction = require('../models/Transaction');
// const User = require('../models/User');




/**
 * // @desc      Get all Transactions
 * // @route     GET /api/v1/auth/transactions
 * // @access    Private/Admin
 */
// eslint-disable-next-line no-unused-vars
exports.getTransactions = asyncHandler(async (req, res, next) => {
  let transaction = await Transaction.find();
    
  res.status(200).json({'success': true, transactions: transaction});
});

/**
 * // @desc      Create user
 * // @route     PUT /api/v1/auth/transactions/
 * // @access    
 */
// eslint-disable-next-line no-unused-vars
exports.createTransaction = asyncHandler(async (req, res, next) => {
  const { user ,type, reference, amount } = req.body;
    
  const trans = await Transaction.create({
    user,
    reference,
    amount,
    type
  });

  res.status(201).json({
    success: true,
    data: trans
  });
});
