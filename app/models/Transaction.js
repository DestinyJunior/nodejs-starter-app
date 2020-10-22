const mongoose = require('mongoose');
// const User = require('./User');

const TransactionSchema = new mongoose.Schema({
  user: {
    type: String,
    required: [true, 'User is required']
  },
  reference: {
    type: String,
    required: [true, 'Reference is required']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required']
  },
  type: {
    type: String,
    required: [true, 'Transaction type is required']  
  },
  status: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now()
  }
});

module.exports = mongoose.model('Transaction', TransactionSchema);

