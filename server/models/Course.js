const mongoose = require('mongoose');
const { Schema } = mongoose;

const EnrolledStudentSub = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student' },
  studentName: String,
  enrollmentDate: { type: Date, default: Date.now }
}, { _id: true });

const CourseSchema = new Schema({
  courseId: { type: String, unique: true, index: true },
  courseName: String,
  maxStudents: Number,
  professor: String,
  currentEnrollment: { type: Number, default: 0 },
  enrolledStudents: [EnrolledStudentSub],
  schedule: {
    days: [String],
    time: String,
    location: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Course', CourseSchema);