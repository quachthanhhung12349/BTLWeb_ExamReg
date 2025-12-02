const mongoose = require('mongoose');
const { Schema } = mongoose;

const RegisteredStudentSub = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student' },
  studentName: String,
  registerTime: { type: Date, default: Date.now }
}, { _id: true });

const RoomSub = new Schema({
  roomId: String,
  campus: String,
  roomName: String,
  maxStudents: Number,
  currentEnrollment: { type: Number, default: 0 }
}, { _id: false });

const SessionSub = new Schema({
  examDate: Date,
  startTime: Date,
  endTime: Date,
  subject: String,
  room: RoomSub,
  registeredStudents: [RegisteredStudentSub]
}, { timestamps: true });

const ExamSchema = new Schema({
  examId: { type: String, index: true },
  examName: String,
  startDate: Date,
  endDate: Date,
  sessions: [SessionSub]
}, { timestamps: true });

module.exports = mongoose.model('Exam', ExamSchema);