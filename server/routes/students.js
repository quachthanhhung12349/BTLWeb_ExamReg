const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Course = require('../models/Course');

const validate = require('../middleware/validate');
const { createStudentSchema, updateStudentSchema } = require('../validations/studentValidation');

// list
router.get('/', async (req, res) => {
  const students = await Student.find().sort({ createdAt: -1 });
  res.json(students);
});

// get by id
router.get('/:id', async (req, res) => {
  const s = await Student.findById(req.params.id);
  if (!s) return res.status(404).json({ message: 'Not found' });
  res.json(s);
});

// create
router.post('/', validate(createStudentSchema), async (req, res) => {
  const { studentId, name, class: className, email, birthDate, account, eligibleForExam } = req.body;
  if (!name || !email) return res.status(400).json({ message: 'Missing fields' });

  try {
    if (await Student.findOne({ email })) return res.status(409).json({ message: 'Email exists' });
    if (studentId && await Student.findOne({ studentId })) return res.status(409).json({ message: 'studentId exists' });

    const finalAccount = account || {
          username: studentId || email.split('@')[0], 
          password: studentId || "123456"             
      };

    const availableCourses = await Course.find().limit(5); 
    
    const defaultCourses = availableCourses.map(c => ({
        courseId: c.courseId,
        courseName: c.name,
        enrolledDate: new Date()
    }));

    const s = new Student({ 
        studentId, 
        name, 
        class: className, 
        email, 
        birthDate, 
        account: finalAccount, // Lưu vào DB
        eligibleForExam,
        courses: defaultCourses
    });
    await s.save();
    res.status(201).json(s);
  } catch (error) {
    console.error("Error while creating student:", error);
    res.status(500).json({ message: error.message });
  }
});

// update
router.put('/:id', validate(updateStudentSchema), async (req, res) => {
  const s = await Student.findById(req.params.id);
  if (!s) return res.status(404).json({ message: 'Not found' });

  const { studentId, email } = req.body;
  if (studentId && await Student.findOne({ studentId, _id: { $ne: s._id } })) {
    return res.status(409).json({ message: 'studentId exists' });
  }
  if (email && await Student.findOne({ email, _id: { $ne: s._id } })) {
    return res.status(409).json({ message: 'email exists' });
  }

  Object.assign(s, req.body);
  await s.save();
  res.json(s);
});

// delete
router.delete('/:id', async (req, res) => {
  const s = await Student.findById(req.params.id);
  if (!s) return res.status(404).json({ message: 'Not found' });
  await Student.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;