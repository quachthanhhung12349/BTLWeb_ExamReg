const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CourseStudentSchema = new Schema({
    studentId: { type: String, ref: 'Student', required: true }, // Mã sinh viên (VD: 21020345)
    courseId: { type: String, ref: 'Course', required: true },   // Mã học phần (VD: INT3306)
    
    metCondition: { 
        type: Boolean, 
        default: true
    },
    
    note: { type: String }
}, { timestamps: true });

CourseStudentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model('CourseStudent', CourseStudentSchema);