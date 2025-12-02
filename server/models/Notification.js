const mongoose = require('mongoose');
const { Schema } = mongoose;

const RecipientSub = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student' },
  studentName: String,
  read: { type: Boolean, default: false },
  readDate: Date
}, { _id: true });

const NotificationSchema = new Schema({
  title: { type: String, required: true },
  text: String,
  date: { type: Date, default: Date.now },
  sender: {
    staffId: { type: Schema.Types.ObjectId, ref: 'Staff' },
    staffName: String
  },
  recipients: [RecipientSub],
  target: { type: String, enum: ['all', 'class', 'specific'], default: 'all' }
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);