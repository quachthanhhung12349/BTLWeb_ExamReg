const Joi = require('joi');

const createExamRoomSchema = Joi.object({
    roomId: Joi.string().min(2).max(10).required().messages({
        'string.empty': 'Mã phòng không được để trống',
        'any.required': 'Vui lòng nhập Mã phòng (VD: 301-G2)'
    }),
    location: Joi.string().max(100).allow('').messages({
        'string.max': 'Địa điểm quá dài'
    }),
    capacity: Joi.number().min(1).max(500).required().messages({
        'number.base': 'Sức chứa phải là số',
        'number.min': 'Sức chứa tối thiểu là 1',
        'any.required': 'Vui lòng nhập Sức chứa'
    }),
    status: Joi.string().valid('available', 'maintenance', 'occupied').default('available')
});

const updateExamRoomSchema = Joi.object({
    roomId: Joi.string().min(2).max(10),
    location: Joi.string().max(100).allow(''),
    capacity: Joi.number().min(1).max(500),
    status: Joi.string().valid('available', 'maintenance', 'occupied')
}).min(1);

module.exports = {
    createExamRoomSchema,
    updateExamRoomSchema
};