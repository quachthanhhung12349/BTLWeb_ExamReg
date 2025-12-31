const mongoose = require('mongoose');
const { Schema } = mongoose;

const RegisteredStudentSub = new Schema({
  studentId: { type: String, ref: 'Student' },
  studentName: String,
  registerTime: { type: Date, default: Date.now }
}, { _id: true });

const SessionSub = new Schema({
  course: { type: String, required: true },
  examDate: Date,
  startTime: Date,
  endTime: Date,
  course: String,
  roomId: { type: Schema.Types.ObjectId, ref: 'ExamRoom', default: null }, // reference to exam room
  registeredStudents: [RegisteredStudentSub]
}, { timestamps: true });

const ExamSchema = new Schema({
  examId: { type: String, index: true },
  examName: String,
  semester: { type: String, default: '1' },
  year: { type: String },
  description: String,
  startDate: Date,
  endDate: Date,
  sessions: [SessionSub]
}, { timestamps: true });

module.exports = mongoose.model('Exam', ExamSchema);