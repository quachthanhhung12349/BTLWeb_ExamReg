const Joi = require('joi');

const createCourseSchema = Joi.object({
    courseId: Joi.string().min(4).max(10).required().messages({
        'string.base': 'Mã môn học phải là chuỗi',
        'string.empty': 'Mã môn học không được để trống',
        'string.min': 'Mã môn quá ngắn (VD: INT1234)',
        'any.required': 'Vui lòng nhập Mã môn học'
    }),
    courseName: Joi.string().min(5).max(100).required().messages({
        'string.empty': 'Tên môn học không được để trống',
        'any.required': 'Vui lòng nhập Tên môn học'
    }),
    credits: Joi.number().min(1).max(10).default(3).messages({
        'number.base': 'Số tín chỉ phải là số',
        'number.min': 'Số tín chỉ tối thiểu là 1'
    }),
    maxStudents: Joi.number().min(1).default(100),
    professor: Joi.string().allow(''),
    schedule: Joi.object({
        days: Joi.array().items(Joi.string()),
        time: Joi.string().allow(''),
        location: Joi.string().allow('')
    }).optional()
});

const updateCourseSchema = Joi.object({
    courseId: Joi.string().min(4).max(10),
    courseName: Joi.string().min(5).max(100),
    credits: Joi.number().min(1).max(10),
    maxStudents: Joi.number().min(1),
    professor: Joi.string().allow(''),
    schedule: Joi.object().optional()
}).min(1);

module.exports = {
    createCourseSchema,
    updateCourseSchema
};