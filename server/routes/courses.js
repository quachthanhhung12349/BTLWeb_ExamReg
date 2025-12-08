const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Course = require('../models/Course');

// GET all courses
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 }).exec();
    res.json(courses);
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
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Create course
router.post('/', async (req, res) => {
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
router.put('/:id', async (req, res) => {
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

module.exports = router;
