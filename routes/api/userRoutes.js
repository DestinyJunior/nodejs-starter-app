// const mongoose = require('mongoose');
const router = require('express').Router();
// const User = mongoose.model('User');

router.post('/create', (req, res, next) => {

  console.log(req.body);
    
  return res.json({
    status: 201,
    message: 'created'
  });
    
});


module.exports = router;