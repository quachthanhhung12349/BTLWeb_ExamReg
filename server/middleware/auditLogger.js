const AuditLog = require('../models/AuditLog');

const auditLogger = async (req, res, next) => {
    // Chỉ ghi log các hành động thay đổi dữ liệu (bỏ qua GET để đỡ rác DB)
    if (req.method === 'GET') {
        return next();
    }

    // Lưu lại hàm send gốc để lấy được status code sau khi xử lý xong
    const originalSend = res.send;

    res.send = function (data) {
        // Khôi phục hàm send gốc để phản hồi cho client
        originalSend.apply(res, arguments);

        // Sau khi phản hồi xong thì tiến hành ghi log (chạy ngầm)
        const logEntry = new AuditLog({
            method: req.method,
            path: req.originalUrl,
            action: `Thực hiện ${req.method} tại ${req.originalUrl}`,
            // Nếu bạn có middleware xác thực user thì thay 'Admin' bằng req.user.name
            user: req.body.username || 'Admin/User', 
            details: req.body, // Lưu lại dữ liệu client gửi lên
            status: res.statusCode
        });

        logEntry.save().catch(err => console.error("Lỗi ghi log:", err));
    };

    next();
};

module.exports = auditLogger;