const mongoose = require('mongoose');


const NotificationSchema = new mongoose.Schema({
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  imageUrl: {
    type: String,
    required: [true, 'Image url is required']
  },
  createdAt: {
    type: Date,
    default: Date.now()
  }
});

module.exports = mongoose.model('Notification', NotificationSchema);

