const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AuditLogSchema = new Schema({
    method: { type: String, required: true },      // GET, POST, PUT, DELETE
    path: { type: String, required: true },        // API path
    action: { type: String },                      // Mo ta hanh dong
    user: { type: String, default: 'System/Admin' }, // Doi tuong thuc hien hanh dong
    details: { type: Object },                     // Du lieu chi tiet (request body)
    status: { type: Number },                      // HTTP status code
    timestamp: { type: Date, default: Date.now }   // Thoi gian thuc hien
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);