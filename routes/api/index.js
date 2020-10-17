const apiRoutes = require('express').Router();

// add api routes below

apiRoutes.use('/auth/users', require('./modules/userRoutes'));


module.exports = apiRoutes;