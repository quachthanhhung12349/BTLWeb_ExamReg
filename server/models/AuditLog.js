const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AuditLogSchema = new Schema({
    method: { type: String, required: true },      // GET, POST, PUT, DELETE
    path: { type: String, required: true },        // Đường dẫn API (VD: /api/exams)
    action: { type: String },                      // Mô tả hành động
    user: { type: String, default: 'System/Admin' }, // Ai thực hiện?
    details: { type: Object },                     // Dữ liệu gửi lên (req.body)
    status: { type: Number },                      // Mã lỗi (200, 400, 500)
    timestamp: { type: Date, default: Date.now }   // Thời gian
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);