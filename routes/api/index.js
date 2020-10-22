const apiRoutes = require('express').Router();

// add api routes below

apiRoutes.use('/auth/accounts', require('./modules/authRoutes'));

apiRoutes.use('/auth/users', require('./modules/userRoutes'));

apiRoutes.use('/transactions', require('./modules/transactionRoutes'));




module.exports = apiRoutes;