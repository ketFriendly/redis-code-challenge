const joi = require('joi')

const CriteriaSchema = joi.object().keys({
  device: joi
    .array()
    .items(joi.string().valid('mobile', 'desktop'))
    .min(1)
    .required(),
  hour: joi.array().items(joi.number().min(0).max(23)).min(1).required(),
  day: joi.array().items(joi.number().min(0).max(7)).min(1).required(),
  state: joi.array().items(joi.string().length(2)).min(1).required()
})

module.exports = {
  CriteriaSchema
}
