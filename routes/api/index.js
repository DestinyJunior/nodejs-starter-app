const apiRoutes = require('express').Router();

// add api routes below

apiRoutes.use('/users', require('./userRoutes'));


module.exports = apiRoutes;