const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const ExamRoom = require('../models/ExamRoom');

const toTrimmedString = (value) => {
  if (value === undefined || value === null) return '';
  return String(value).trim();
};

const normalizeRoomPayload = (body = {}) => {
  const roomId = toTrimmedString(body.roomId ?? body.code ?? '');
  const campus = toTrimmedString(body.campus ?? body.building ?? '');
  const room = toTrimmedString(body.room ?? body.roomName ?? '');
  const rawMax = body.maxStudents ?? body.capacity ?? body.max_students ?? body.maxstudents ?? body.capacityValue;
  const maxStudents = rawMax === undefined || rawMax === null || rawMax === '' ? NaN : Number(rawMax);
  return { roomId, campus, room, maxStudents };
};

const validateRoomPayload = ({ roomId, campus, room, maxStudents }) => {
  if (!roomId) return 'roomId is required';
  if (!campus) return 'campus is required';
  if (!room) return 'room name is required';
  if (!Number.isFinite(maxStudents) || maxStudents <= 0) return 'maxStudents must be a positive number';
  return null;
};

// GET all rooms
router.get('/', async (req, res) => {
  try {
    const rooms = await ExamRoom.find().sort({ createdAt: -1 }).exec();
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET one
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });
  try {
    const room = await ExamRoom.findById(id).exec();
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Create
router.post('/', async (req, res) => {
  try {
    console.log('📥 POST /exam-rooms raw body:', JSON.stringify(req.body, null, 2));
    const payload = normalizeRoomPayload(req.body);
    console.log('✅ Normalized payload:', JSON.stringify(payload, null, 2));
    const validationError = validateRoomPayload(payload);
    if (validationError) {
      console.error('❌ Validation error:', validationError);
      return res.status(400).json({ message: validationError });
    }
    const newRoom = new ExamRoom(payload);
    console.log('📝 Room before save:', JSON.stringify(newRoom.toObject(), null, 2));
    await newRoom.save();
    console.log('💾 Room saved:', JSON.stringify(newRoom.toObject(), null, 2));
    res.status(201).json(newRoom);
  } catch (err) {
    console.error('❌ Error in POST:', err);
    if (err.code === 11000) return res.status(409).json({ message: 'roomId already exists' });
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });
  try {
    console.log('Valid Schema Paths:', Object.keys(ExamRoom.schema.paths));
    console.log('📥 PUT /exam-rooms/:id raw body:', JSON.stringify(req.body, null, 2));
    const payload = normalizeRoomPayload(req.body);
    console.log('✅ Normalized payload:', JSON.stringify(payload, null, 2));
    const validationError = validateRoomPayload(payload);
    if (validationError) {
      console.error('❌ Validation error:', validationError);
      return res.status(400).json({ message: validationError });
    }
    console.log('🔄 Updating with payload:', JSON.stringify(payload, null, 2));
    const updated = await ExamRoom.findByIdAndUpdate(id, payload, { new: true, runValidators: true }).exec();
    if (!updated) return res.status(404).json({ message: 'Room not found' });
    console.log('💾 Room after update:', JSON.stringify(updated.toObject(), null, 2));
    res.json(updated);
  } catch (err) {
    console.error('❌ Error in PUT:', err);
    if (err.code === 11000) return res.status(409).json({ message: 'roomId already exists' });
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });
  try {
    const removed = await ExamRoom.findByIdAndDelete(id).exec();
    if (!removed) return res.status(404).json({ message: 'Room not found' });
    res.json({ message: 'Deleted', room: removed });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
