const mongoose = require('mongoose');
const { Schema } = mongoose;

const AccountSub = new Schema({
  username: { type: String },
  password: { type: String },
  role: { type: String, default: 'Staff' },
  permissions: [String]
}, { _id: false });

const SentNotificationSub = new Schema({
  notificationId: { type: Schema.Types.ObjectId },
  title: String,
  sentDate: { type: Date, default: Date.now }
}, { _id: true });

const StaffSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  account: AccountSub,
  sentNotifications: [SentNotificationSub]
}, { timestamps: true });

module.exports = mongoose.model('Staff', StaffSchema);