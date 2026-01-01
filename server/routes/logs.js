const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');

// GET /api/admin/logs
router.get('/', async (req, res) => {
    try {
        // Lay 100 ban ghi log moi nhat
        const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(100);
        res.json({ success: true, logs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;