const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

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
router.post('/', async (req, res) => {
  const { studentId, name, class: className, email, birthDate, account, eligibleForExam } = req.body;
  if (!name || !email) return res.status(400).json({ message: 'Missing fields' });

  if (await Student.findOne({ email })) return res.status(409).json({ message: 'Email exists' });
  if (studentId && await Student.findOne({ studentId })) return res.status(409).json({ message: 'studentId exists' });

  const s = new Student({ studentId, name, class: className, email, birthDate, account, eligibleForExam });
  await s.save();
  res.status(201).json(s);
});

// update
router.put('/:id', async (req, res) => {
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
  await s.remove();
  res.json({ message: 'Deleted' });
});

module.exports = router;