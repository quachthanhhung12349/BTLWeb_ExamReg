// server/validations/studentValidation.js
const Joi = require('joi');

const createStudentSchema = Joi.object({
    studentId: Joi.string().min(5).max(20).required().messages({
        'string.base': 'Mã sinh viên phải là chuỗi ký tự',
        'string.empty': 'Mã sinh viên không được để trống',
        'string.min': 'Mã sinh viên quá ngắn (tối thiểu 5 ký tự)',
        'string.max': 'Mã sinh viên quá dài (tối đa 20 ký tự)',
        'any.required': 'Vui lòng nhập Mã sinh viên'
    }),
    name: Joi.string().min(2).max(100).required().messages({
        'string.empty': 'Họ và tên không được để trống',
        'string.min': 'Tên quá ngắn (tối thiểu 2 ký tự)',
        'any.required': 'Vui lòng nhập Họ và tên'
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'Email không đúng định dạng',
        'string.empty': 'Email không được để trống',
        'any.required': 'Vui lòng nhập Email'
    }),
    class: Joi.string().allow('').max(50).messages({
        'string.max': 'Tên lớp quá dài'
    }),
    birthDate: Joi.date().iso().less('now').messages({
        'date.base': 'Ngày sinh không hợp lệ',
        'date.less': 'Ngày sinh phải nhỏ hơn ngày hiện tại'
    }),
    eligibleForExam: Joi.boolean().default(false),
    
    account: Joi.object({
        username: Joi.string().min(3),
        password: Joi.string().min(6)
    }).optional()
});

const updateStudentSchema = Joi.object({
    studentId: Joi.string().min(5).max(20),
    name: Joi.string().min(2).max(100),
    email: Joi.string().email(),
    class: Joi.string().allow('').max(50),
    birthDate: Joi.date().iso().less('now'),
    eligibleForExam: Joi.boolean(),
    
    account: Joi.object({
        username: Joi.string().min(3),
        password: Joi.string().min(6),
        role: Joi.string()
    })
}).min(1);

module.exports = {
    createStudentSchema,
    updateStudentSchema
};