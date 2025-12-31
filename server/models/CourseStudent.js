const mongoose = require('mongoose');

const CourseStudentSchema = new mongoose.Schema({
    studentId: { type: String, ref: 'Student', required: true },
    courseId: { type: String, ref: 'Course', required: true },
    studentName: { type: String },
    classId: { type: String },
    metCondition: { type: Boolean, default: true },
    note: { type: String, default: '' }
}, { timestamps: true });

CourseStudentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });
module.exports = mongoose.model('CourseStudent', CourseStudentSchema);