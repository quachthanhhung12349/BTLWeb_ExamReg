const Joi = require('joi');

const createExamRoomSchema = Joi.object({
    roomId: Joi.string().min(2).max(10).required().messages({
        'string.empty': 'Mã phòng không được để trống',
        'any.required': 'Vui lòng nhập Mã phòng (VD: 301-G2)'
    }),
    room: Joi.string().min(1).max(50).required().messages({
        'string.empty': 'Tên phòng không được để trống',
        'any.required': 'Vui lòng nhập Tên phòng',
        'string.max': 'Tên phòng quá dài'
    }),
    location: Joi.string().max(100).allow('').optional(),
    capacity: Joi.number().min(1).max(500).optional(),
    maxStudents: Joi.number().min(1).max(500).required().messages({
        'number.base': 'Sức chứa phải là số',
        'number.min': 'Sức chứa tối thiểu là 1',
        'any.required': 'Vui lòng nhập Sức chứa'
    }),
    campus: Joi.string().max(100).optional(),
    status: Joi.string().valid('available', 'maintenance', 'occupied').optional()
});

const updateExamRoomSchema = Joi.object({
    roomId: Joi.string().min(2).max(10),
    room: Joi.string().min(2).max(50).allow(''),
    location: Joi.string().max(100).allow(''),
    capacity: Joi.number().min(1).max(500),
    maxStudents: Joi.number().min(1).max(500),
    campus: Joi.string().max(100),
    status: Joi.string().valid('available', 'maintenance', 'occupied')
}).min(1);

module.exports = {
    createExamRoomSchema,
    updateExamRoomSchema
};