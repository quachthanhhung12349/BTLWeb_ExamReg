const mongoose = require('mongoose');
const { Schema } = mongoose;

const ExamRoomSchema = new Schema({
  roomId: { type: String, required: true, unique: true, index: true },
  room: { type: String, required: true },
  location: { type: String, default: '' },
  capacity: { type: Number },
  maxStudents: { type: Number, required: true },
  campus: { type: String, default: 'Main Campus' },
  status: { type: String, enum: ['available', 'maintenance', 'occupied'], default: 'available' }
}, { timestamps: true });

module.exports = mongoose.model('ExamRoom', ExamRoomSchema, 'exam_rooms');
