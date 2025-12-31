const mongoose = require('mongoose');
const { Schema } = mongoose;

const ExamRoomSchema = new Schema({
  roomId: { type: String, required: true, unique: true, index: true },
  location: { type: String, required: true },
  capacity: { type: Number, required: true },
  status: { type: String, enum: ['available', 'maintenance', 'occupied'], default: 'available' }
}, { timestamps: true });

module.exports = mongoose.model('ExamRoom', ExamRoomSchema, 'exam_rooms');
