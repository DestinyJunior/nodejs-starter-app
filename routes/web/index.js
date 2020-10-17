const webRoutes = require('express').Router();

// add web routes below

webRoutes.use('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.write('<h1>WELCOME TO NODE JS STARTER KIT<h1>');
  
  setTimeout(() => {
    res.end();
  }, 1000);
  
  
});


module.exports = webRoutes;