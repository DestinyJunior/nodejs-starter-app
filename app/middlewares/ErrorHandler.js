/* eslint-disable no-unused-vars */
import  ErrorResponse from '../helpers/errorResponse.js'

const errorHandler = (err, req, res, next) => {
  let error = { ...err };

  error.message = err.message;

  // Log to console for development
  console.log(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new ErrorResponse(message, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    // get the dup key field out of the err message 
    var field = err.message.split('index:')[1];
    // now we have `field_1 dup key`
    field = field.split(' dup key')[0];
    field = field.substring(0, field.lastIndexOf('_')); // returns field
    const message = `${field} already exists`;
    error = new ErrorResponse(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = new ErrorResponse(message, 400);
  }

  if (error.message === 'Route Not found') {
    const message = 'Requested resource not found';
    error = new ErrorResponse(message, 404);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error'
  });

};

export default errorHandler;
