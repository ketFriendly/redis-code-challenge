require("dotenv").config();
const rk = require("rk");
const createClient = require("../redis");
const { validateBuyer } = require("../models/buyer.model");

const client = createClient(process.env.REDIS_PORT, process.env.HOST, {
  fast: true,
});
//let client = client.multi();

const postBuyer = async (buyer) => {
  console.log(buyer.id);
  const validationResult = await validateBuyer(buyer);
  if (validationResult.error) {
    console.log(validationResult.error);
    return validationResult.error;
  }
  saveBuyer(buyer);
};

const saveBuyer = (buyer) => {
  //save buyer
  // buyer:id
  let buyerKey = rk("buyer", buyer.id);
  const numberOfOffers = buyer.offers.length;
  client.sadd("all-buyers", buyer.id); // add buyer id to all-buyers set - key:array

  //offers
  //buyer:id:offers
  client.hmset("all-offers-length", rk(buyerKey, "offers"), numberOfOffers); //all-offers-length buyer:id:offers length
  saveBuyersOffers(buyer.offers, buyerKey);
};

const saveBuyersOffers = (offers, buyerKey) => {
  offers.forEach((offer, index) => {
    //go through all buyers offers
    let offerKey = rk(buyerKey, "offers", index); //buyer:id:offers:index
    // save offers
    client.hmset(
      offerKey,
      "value",
      offer.value,
      "location",
      offer.location,
      "criteria",
      rk(offerKey, "criteria")
    ); //buyer:id:offers:index value:null location:url
    //add criteria above?
    saveBuyersOffersCriteria(offer.criteria, offerKey);
  });
};

const saveBuyersOffersCriteria = (criteria, offerKey) => {
  let criteriaKey = rk(offerKey, "criteria"); // buyer:id:offers:index:criteria
  //add to set
  client.sadd(rk(criteriaKey, "device"), criteria.device); //buyer:id:offers:index:criteria:index:device  = [array of devices]
  client.sadd(rk(criteriaKey, "hour"), criteria.hour);
  client.sadd(rk(criteriaKey, "day"), criteria.day);
  client.sadd(rk(criteriaKey, "state"), criteria.state);

  //criteria.device.forEach(device => device === "mobile"? client.sadd("all-mobile-devices", rk(criteriaKey,"device")) : client.sadd("all-desktop-devices", rk(criteriaKey,"device")));

  //for querying location based on device, hour, day and state
  criteria.device.forEach((device) => client.sadd(device, offerKey));
  criteria.hour.forEach((h) => client.sadd(rk("h", h), offerKey)); //set in format 0 = buyer:id:offers:index
  criteria.day.forEach((d) => client.sadd(rk("d", d), offerKey)); //
  criteria.state.forEach((stat) => client.sadd(stat, offerKey));
};

module.exports = {
  postBuyer,
};
