const path = require('path');
const express = require('express');
const env = require('dotenv');
const morgan = require('morgan');
const dbErrorHandler = require('./app/middlewares/dbErrorHandler');
const DB = require('./configs/database');


  
// Load Environment 
env.config({ path: './.env' });


// Connect to database
DB();


const app = express();

// body requests parser
app.use(express.json());

// import routes files
const apiRoutes = require('./routes/api/index');
const webRoutes = require('./routes/web/index');

//development mode middle ware logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// app.use(logger);


// middle ware error handler
app.use(dbErrorHandler);


// initialize routers
app.use('/api/v1', apiRoutes);
app.use('/', webRoutes);


app.use(express.static(path.join(__dirname, 'public')));


// set static storage folder



module.exports = app;
