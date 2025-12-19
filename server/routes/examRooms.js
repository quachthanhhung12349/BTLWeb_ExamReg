const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const ExamRoom = require('../models/ExamRoom');

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
    const { roomId, building, roomName, capacity } = req.body;
    const room = new ExamRoom({ roomId, building, roomName, capacity });
    await room.save();
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });
  try {
    const { roomId, building, roomName, capacity } = req.body;
    const updated = await ExamRoom.findByIdAndUpdate(id, { roomId, building, roomName, capacity }, { new: true }).exec();
    if (!updated) return res.status(404).json({ message: 'Room not found' });
    res.json(updated);
  } catch (err) {
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
