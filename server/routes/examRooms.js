const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const ExamRoom = require('../models/ExamRoom');

const validate = require('../middleware/validate');
const { createExamRoomSchema, updateExamRoomSchema } = require('../validations/examRoomValidation');

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
router.post('/', validate(createExamRoomSchema), async (req, res) => {
  try {
    const { roomId, room, location, capacity, maxStudents, campus, status } = req.body;
    
    const exists = await ExamRoom.findOne({ roomId });
    if (exists) return res.status(409).json({ message: 'Mã phòng đã tồn tại' });

    const newRoom = new ExamRoom({ 
      roomId, 
      room: room || roomId, 
      location: location || '', 
      capacity: capacity || maxStudents, 
      maxStudents: maxStudents, 
      campus: campus || 'Main Campus',
      status: status || 'available' 
    });
    await newRoom.save();
    res.status(201).json(newRoom);
  } catch (err) {
    console.error('❌ Error in POST:', err);
    if (err.code === 11000) return res.status(409).json({ message: 'roomId already exists' });
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update
router.put('/:id', validate(updateExamRoomSchema), async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });
  try {
    const { roomId, room, location, capacity, maxStudents, campus, status } = req.body;
    
    if (roomId) {
        const exists = await ExamRoom.findOne({ roomId, _id: { $ne: id } });
        if (exists) return res.status(409).json({ message: 'Mã phòng đã tồn tại' });
    }

    const updated = await ExamRoom.findByIdAndUpdate(
        id, 
        { 
          roomId, 
          room: room || roomId, 
          location: location || '', 
          capacity: capacity || maxStudents,
          maxStudents: maxStudents || capacity,
          campus: campus || 'Main Campus',
          status: status || 'available' 
        }, 
        { new: true }
    ).exec();
    
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