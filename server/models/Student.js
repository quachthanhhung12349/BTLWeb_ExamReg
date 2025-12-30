const mongoose = require('mongoose');
const { Schema } = mongoose;

const NotificationSub = new Schema({
  title: String,
  text: String,
  date: { type: Date, default: Date.now },
  read: { type: Boolean, default: false }
}, { _id: true });

const RegisteredExamSub = new Schema({
  examId: { type: Schema.Types.ObjectId, ref: 'Exam' },
  examName: String,
  sessionId: { type: Schema.Types.ObjectId },
  courseId: String,
  registerTime: { type: Date, default: Date.now },
  status: { type: String, default: 'registered' }
}, { _id: true });

const CourseEnrollmentSub = new Schema({
  courseId: String,
  courseName: String,
  enrolledDate: { type: Date, default: Date.now }
}, { _id: true });

const AccountSub = new Schema({
  username: { type: String },
  password: { type: String }, // store hashed password
  role: { type: String, default: 'Student' },
  lastLogin: Date
}, { _id: false });

const StudentSchema = new Schema({
  studentId: { type: String, index: true }, // optional original id
  name: { type: String, required: true },
  class: { type: String },
  email: { type: String, required: true, unique: true, index: true },
  birthDate: Date,
  account: AccountSub,
  eligibleForExam: { type: Boolean, default: false },
  notifications: [NotificationSub],
  registeredExams: [RegisteredExamSub],
  courses: [CourseEnrollmentSub]
}, { timestamps: true });

module.exports = mongoose.model('Student', StudentSchema);