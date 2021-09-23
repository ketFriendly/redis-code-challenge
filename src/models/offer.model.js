const joi = require('joi')
const { CriteriaSchema } = require('./criteria.model')

const OfferSchema = joi.object({
  criteria: CriteriaSchema,
  value: joi.number().min(1).max(10000).required(),
  location: joi
    .string()
    .min(1)
    .uri({ scheme: ['http', 'https'] })
    .required()
})

module.exports = {
  OfferSchema
}
