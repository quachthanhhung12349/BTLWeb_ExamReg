const AuditLog = require('../models/AuditLog');

const auditLogger = async (req, res, next) => {
    // Chi log khi thay doi du lieu (khong phai GET)
    if (req.method === 'GET') {
        return next();
    }

    // Luu lai ham send goc de goi sau
    const originalSend = res.send;

    res.send = function (data) {
        // Khoi phuc ham send goc de gui phan hoi
        originalSend.apply(res, arguments);

        // Ghi log sau khi phan hoi da duoc gui
        const logEntry = new AuditLog({
            method: req.method,
            path: req.originalUrl,
            action: `Thực hiện ${req.method} tại ${req.originalUrl}`,
            // Tham dinh nguoi dung la Admin/User neu khong co thong tin dang nhap
            user: req.body.username || 'Admin/User', 
            details: req.body,
            status: res.statusCode
        });

        logEntry.save().catch(err => console.error("Lỗi ghi log:", err));
    };

    next();
};

module.exports = auditLogger;