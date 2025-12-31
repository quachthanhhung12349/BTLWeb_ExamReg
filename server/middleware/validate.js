// server/middleware/validate.js
const validate = (schema) => (req, res, next) => {
  // abortEarly: false giúp hiển thị TẤT CẢ các lỗi thay vì chỉ lỗi đầu tiên
  const { error } = schema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const errorDetails = error.details.map((detail) => ({
      field: detail.path[0],
      message: detail.message.replace(/['"]/g, '') // Loại bỏ dấu ngoặc kép thừa
    }));

    return res.status(400).json({
      success: false,
      message: 'Dữ liệu gửi lên không hợp lệ',
      errors: errorDetails
    });
  }
  
  next();
};

module.exports = validate;