const joi = require("joi");

const CriteriaSchema = joi.object().keys({
  device: joi
    .array()
    .items(joi.string().valid("mobile", "desktop"))
    .min(1)
    .required(),
  hour: joi.array().items(joi.number().min(0).max(23)).min(1).required(),
  day: joi.array().items(joi.number().min(0).max(7)).min(1).required(),
  state: joi.array().items(joi.string().length(2)).min(1).required(),
});

const OfferSchema = joi.object({
  criteria: CriteriaSchema,
  value: joi.number().min(1).max(10000).required(),
  location: joi
    .string()
    .min(1)
    .uri({ scheme: ["http", "https"] })
    .required(),
});

const BuyerSchema = joi.object({
  id: joi.string().pattern(new RegExp("^[a-z]")).length(1),
  offers: joi.array().items(OfferSchema).min(1).required(),
});

const validateBuyer = async (buyerToValidate) => {
  let error = null;
  let value = null;
  try {
    const buyer = await BuyerSchema.validateAsync(buyerToValidate, {
      allowUnknown: true,
      abortEarly: false,
    });
    value = buyer;
  } catch (e) {
    error = e;
  }
  return { error, value };
};

const validateCriteria = async (criteriaToValidate) => {
  let error = null;
  let value = null;
  try {
    const criteria = await CriteriaSchema.validateAsync(criteriaToValidate, {
      allowUnknown: true,
      abortEarly: false,
    });
    value = criteria;
  } catch (e) {
    error = e;
  }
  return { error, value };
};
module.exports = {
  validateBuyer,
  validateCriteria,
};
