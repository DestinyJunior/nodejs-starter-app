const env = require('dotenv');

const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const dbErrorHandler = require('./app/middlewares/dbErrorHandler');
const DB = require('./configs/database');
const cookieParser = require('cookie-parser');

// securing api packages
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');


  
// Load Environment 
env.config({ path: './.env' });


// connect to database
DB();


const app = express();

// body requests parser
app.use(express.json());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// app.use(function (req, res, next) {
//   //res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
//   res.header('Access-Control-Allow-Headers', 'Content-Type');
//   next();
// });


// cookie parser
app.use(cookieParser());

// import routes files
const apiRoutes = require('./routes/api/index');
// const webRoutes = require('./routes/web/index');

//development mode middle ware logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// middleware error handler
app.use(dbErrorHandler);

// app.use(logger);

// sanitize data sql or mongo injection
app.use(mongoSanitize());

// set security headers for api security
app.use(helmet());

// prevent XSS attacks
app.use(xss());

// api request rate limiting default : 100 requests in 10minutes
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100
});
app.use(limiter);

// Prevent http param pollution
app.use(hpp());

// enable cors
app.use(cors());





// initialize routers
app.use('/api/', apiRoutes);
// app.use('/', webRoutes);

// Handle 404 Requests
app.use((req, res, next) => {
  const error = new Error('Route Not found');
  error.status = 404;
  next(error);
});


app.use(express.static(path.join(__dirname, 'public')));


// set static storage folder


module.exports = app;
