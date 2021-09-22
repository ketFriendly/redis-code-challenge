const BuyerSchema = require('../../models/buyer.model');
const CriteriaSchema = require('../../models/criteria.model');

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
