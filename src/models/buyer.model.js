const joi = require('joi');
const { OfferSchema } = require('./offer.model');

const BuyerSchema = joi.object({
  id: joi.string().pattern(new RegExp('^[a-z]')).length(1),
  offers: joi.array().items(OfferSchema).min(1).required(),
});

module.exports = {
  BuyerSchema,
};
