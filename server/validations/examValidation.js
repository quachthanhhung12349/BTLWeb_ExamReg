// server/validations/examValidation.js
const Joi = require('joi');

const createExamSchema = Joi.object({
    examId: Joi.string().min(3).max(20).required().messages({
        'string.base': 'Mã kỳ thi phải là chuỗi ký tự',
        'string.empty': 'Mã kỳ thi không được để trống',
        'string.min': 'Mã kỳ thi quá ngắn (tối thiểu 3 ký tự)',
        'string.max': 'Mã kỳ thi quá dài (tối đa 20 ký tự)',
        'any.required': 'Vui lòng nhập Mã kỳ thi'
    }),
    examName: Joi.string().min(5).max(200).required().messages({
        'string.empty': 'Tên kỳ thi không được để trống',
        'string.min': 'Tên kỳ thi quá ngắn (tối thiểu 5 ký tự)',
        'any.required': 'Vui lòng nhập Tên kỳ thi'
    }),
    name: Joi.string().optional().allow(''),
    semester: Joi.string().valid('1', '2', 'Hè').default('1').messages({
        'any.only': 'Học kỳ chỉ được chọn: 1, 2 hoặc Hè'
    }),
    year: Joi.string().pattern(/^\d{4}-\d{4}$/).required().messages({
        'string.pattern.base': 'Năm học phải có định dạng YYYY-YYYY (VD: 2023-2024)',
        'any.required': 'Vui lòng nhập Năm học'
    }),
    startDate: Joi.date().iso().required().messages({
        'date.base': 'Ngày bắt đầu không hợp lệ',
        'any.required': 'Vui lòng chọn Ngày bắt đầu'
    }),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).required().messages({
        'date.min': 'Ngày kết thúc phải diễn ra sau Ngày bắt đầu',
        'any.required': 'Vui lòng chọn Ngày kết thúc'
    }),
    description: Joi.string().max(1000).allow('').messages({
        'string.max': 'Mô tả không được vượt quá 1000 ký tự'
    }),
    status: Joi.string().valid('active', 'upcoming', 'completed', 'cancelled').default('active')
});

const updateExamSchema = Joi.object({
    examName: Joi.string().min(5).max(200),
    name: Joi.string().optional().allow(''),
    semester: Joi.string().valid('1', '2', 'Hè'),
    year: Joi.string().pattern(/^\d{4}-\d{4}$/),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')),
    description: Joi.string().max(1000).allow(''),
    status: Joi.string().valid('active', 'upcoming', 'completed', 'cancelled')
}).min(1);

module.exports = {
    createExamSchema,
    updateExamSchema
};