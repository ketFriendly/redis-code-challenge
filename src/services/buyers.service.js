const {validateBuyer} = require('../models/buyer.model');

const postBuyer = async (buyer) => {
    const validationResult = await validateBuyer(buyer);
    if(validationResult.error){
        return error;
    }
    //save buyer
}

module.exports ={
    postBuyer
}