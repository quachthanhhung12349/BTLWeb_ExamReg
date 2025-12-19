const mongoose = require('mongoose');
const { Schema } = mongoose;

const ExamRoomSchema = new Schema({
  roomId: { type: String, required: true, unique: true, index: true },
  campus: String,
  room: String, // room name/number
  maxStudents: Number
}, { timestamps: true });

module.exports = mongoose.model('ExamRoom', ExamRoomSchema, 'exam_rooms');
