const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Course = require('../models/Course');
const Student = require('../models/Student');

const validate = require('../middleware/validate');
const { createCourseSchema, updateCourseSchema } = require('../validations/courseValidation');

// GET all courses
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 }).exec();
    // Ensure currentEnrollment matches the actual number of enrolled students
    const coursesWithCorrectCount = courses.map(course => {
      const courseObj = course.toObject ? course.toObject() : course;
      courseObj.currentEnrollment = courseObj.enrolledStudents ? courseObj.enrolledStudents.length : 0;
      return courseObj;
    });
    res.json(coursesWithCorrectCount);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET one course
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });
  try {
    const course = await Course.findById(id).exec();
    if (!course) return res.status(404).json({ message: 'Course not found' });
    const courseObj = course.toObject ? course.toObject() : course;
    // Ensure currentEnrollment matches the actual number of enrolled students
    courseObj.currentEnrollment = courseObj.enrolledStudents ? courseObj.enrolledStudents.length : 0;
    res.json(courseObj);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Create course
router.post('/', validate(createCourseSchema), async (req, res) => {
  try {
    const { courseId, courseName, maxStudents, professor, schedule } = req.body;
    if (!courseId || !courseName) return res.status(400).json({ message: 'Missing required fields' });
    const existing = await Course.findOne({ courseId }).exec();
    if (existing) return res.status(409).json({ message: 'courseId already exists' });
    const course = new Course({ courseId, courseName, maxStudents, professor, schedule });
    await course.save();
    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update course
router.put('/:id', validate(updateCourseSchema), async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });
  try {
    const { courseId, courseName, maxStudents, professor, schedule } = req.body;
    // check duplicate courseId
    if (courseId) {
      const dup = await Course.findOne({ courseId, _id: { $ne: id } }).exec();
      if (dup) return res.status(409).json({ message: 'courseId already exists' });
    }
    const updated = await Course.findByIdAndUpdate(id, { courseId, courseName, maxStudents, professor, schedule }, { new: true }).exec();
    if (!updated) return res.status(404).json({ message: 'Course not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete course
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });
  try {
    const removed = await Course.findByIdAndDelete(id).exec();
    if (!removed) return res.status(404).json({ message: 'Course not found' });
    res.json({ message: 'Deleted', course: removed });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Enroll all students (optionally only eligible) into a course
router.post('/:id/enroll-all', async (req, res) => {
  const { id } = req.params;
  const { onlyEligible } = req.body || {};
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });

  try {
    const course = await Course.findById(id).exec();
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const studentQuery = onlyEligible ? { eligibleForExam: true } : {};
    const allStudents = await Student.find(studentQuery, { name: 1 }).exec();

    const alreadyEnrolledIds = new Set((course.enrolledStudents || []).map(e => String(e.studentId)));
    const notYetEnrolled = allStudents.filter(s => !alreadyEnrolledIds.has(String(s._id)));

    // Respect capacity if maxStudents is set
    let availableSlots = Infinity;
    if (typeof course.maxStudents === 'number' && course.maxStudents > 0) {
      availableSlots = Math.max(0, course.maxStudents - (course.currentEnrollment || 0));
    }

    const toEnroll = notYetEnrolled.slice(0, availableSlots);

    // Update course roster
    for (const s of toEnroll) {
      course.enrolledStudents.push({ studentId: s._id, studentName: s.name });
    }
    course.currentEnrollment = (course.currentEnrollment || 0) + toEnroll.length;
    await course.save();

    // Update each student's courses list if missing
    const courseTag = { courseId: course.courseId, courseName: course.courseName };
    const bulkOps = toEnroll.map(s => ({
      updateOne: {
        filter: { _id: s._id, 'courses.courseId': { $ne: course.courseId } },
        update: { $push: { courses: courseTag } }
      }
    }));
    if (bulkOps.length) {
      await Student.bulkWrite(bulkOps);
    }

    res.json({
      message: 'Enrolled students into course',
      courseId: course._id,
      addedCount: toEnroll.length,
      totalEnrollment: course.currentEnrollment
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Enroll specific selected students into a course
router.post('/:id/enroll-students', async (req, res) => {
  const { id } = req.params;
  const { studentIds } = req.body || {};
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });
  if (!Array.isArray(studentIds) || studentIds.length === 0) {
    return res.status(400).json({ message: 'studentIds array required' });
  }

  try {
    const course = await Course.findById(id).exec();
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // Fetch students details to record names, etc.
    const objectIds = studentIds.filter(sid => mongoose.Types.ObjectId.isValid(sid)).map(sid => new mongoose.Types.ObjectId(sid));
    const students = await Student.find({ _id: { $in: objectIds } }, { name: 1 }).exec();

    const alreadyEnrolledIds = new Set((course.enrolledStudents || []).map(e => String(e.studentId)));
    const filtered = students.filter(s => !alreadyEnrolledIds.has(String(s._id)));

    // Respect capacity
    let availableSlots = Infinity;
    if (typeof course.maxStudents === 'number' && course.maxStudents > 0) {
      availableSlots = Math.max(0, course.maxStudents - (course.currentEnrollment || 0));
    }
    const toEnroll = filtered.slice(0, availableSlots);

    for (const s of toEnroll) {
      course.enrolledStudents.push({ studentId: s._id, studentName: s.name });
    }
    course.currentEnrollment = (course.currentEnrollment || 0) + toEnroll.length;
    await course.save();

    const courseTag = { courseId: course.courseId, courseName: course.courseName };
    const bulkOps = toEnroll.map(s => ({
      updateOne: {
        filter: { _id: s._id, 'courses.courseId': { $ne: course.courseId } },
        update: { $push: { courses: courseTag } }
      }
    }));
    if (bulkOps.length) await Student.bulkWrite(bulkOps);

    res.json({ message: 'Selected students enrolled', addedCount: toEnroll.length, totalEnrollment: course.currentEnrollment });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get enrolled students with details
router.get('/:id/enrolled-students', async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });
  try {
    const course = await Course.findById(id).exec();
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const ids = (course.enrolledStudents || []).map(e => e.studentId).filter(Boolean);
    if (!ids.length) return res.json([]);

    const students = await Student.find({ _id: { $in: ids } }).exec();
    const enriched = students.map(s => ({
      _id: s._id,
      studentId: s.studentId,
      name: s.name,
      email: s.email,
      class: s.class,
      eligibleForExam: !!s.eligibleForExam
    }));
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Remove student from course
router.delete('/:id/remove-student/:studentId', async (req, res) => {
  const { id, studentId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid course id' });
  if (!mongoose.Types.ObjectId.isValid(studentId)) return res.status(400).json({ message: 'Invalid student id' });

  try {
    const course = await Course.findById(id).exec();
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // Remove from enrolledStudents
    course.enrolledStudents = (course.enrolledStudents || []).filter(e => String(e.studentId) !== String(studentId));
    course.currentEnrollment = Math.max(0, (course.currentEnrollment || 0) - 1);
    await course.save();

    // Remove course tag from student
    const student = await Student.findById(studentId).exec();
    if (student) {
      student.courses = (student.courses || []).filter(c => c.courseId !== course.courseId);
      await student.save();
    }

    res.json({ message: 'Student removed from course', courseId: id, studentId, currentEnrollment: course.currentEnrollment });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
