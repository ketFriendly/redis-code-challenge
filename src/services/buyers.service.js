require("dotenv").config();
const rk = require("rk");
const createClient = require("../redis");
const { validateBuyer } = require("../models/buyer.model");

const client = createClient(process.env.REDIS_PORT, process.env.HOST, {
  fast: true,
});

const postBuyer = async (buyer) => {
  const validationResult = await validateBuyer(buyer);
  if (validationResult.error) {
    return validationResult.error;
  }
  saveBuyer(buyer);
};

const getBuyerById = async (id) => {
  const buyerExists = await client.sismemberAsync("all-buyers", id);
  if (!buyerExists) {
    return `There are no buyers with the id ${id}`;
  }
  const buyerKey = rk("buyer", id);
  const offersKey = rk(buyerKey, "offers");
  let numberOfOffers = 0;
  let counter = 0;

  const offersCountString = await client.hmgetAsync(
    "all-offers-length",
    offersKey
  );
  const offersCount = parseInt(offersCountString[0]);
  //debug
  const offersArray = [];
  while (counter < offersCount) {
    let offerKey = rk(buyerKey, "offers", counter);
    const offer = await client.hmgetAsync(
      offerKey,
      "value",
      "location",
      "criteria"
    );

    const tempDevice = await client.smembersAsync(rk(offer[2], "device"));
    const tempHour = await client.smembersAsync(rk(offer[2], "hour"));
    const tempDay = await client.smembersAsync(rk(offer[2], "day"));
    const tempState = await client.smembersAsync(rk(offer[2], "state"));
    const tempOffer = {
      value: offer[0],
      location: offer[1],
      criteria: {
        device: tempDevice,
        hour: tempHour.map((x) => parseInt(x)),
        day: tempDay.map((x) => parseInt(x)),
        state: tempState,
      },
    };
    offersArray.push(tempOffer);
    counter++;
  }
  const buyer = {
    id: id,
    offers: offersArray,
  };
  const validationResult = await validateBuyer(buyer);

  return buyer;
};

const getOffer = async (hour, day, device) => {
  //add validation
  const offerKeys = await client.sinterAsync([
    rk("h", hour),
    rk("d", day),
    device,
  ]);
  if (offerKeys.length === 0) {
    return "There are no offers for those parameters";
  }
  let result = await Promise.all(
    offerKeys.map(async (key) => {
      return await client.hmgetAsync(key, "location", "value");
    })
  );
  var sortedArray = result.sort(function (a, b) {
    return b[1] - a[1];
  });
  return sortedArray[0][0];
};
const saveBuyer = (buyer) => {
  //save buyer
  // buyer:id
  let buyerKey = rk("buyer", buyer.id);
  const numberOfOffers = buyer.offers.length;
  client.sadd("all-buyers", buyer.id); // add buyer id to all-buyers set - key:array

  //offers
  //buyer:id:offers
  client.hmset(
    "all-offers-length",
    "id",
    rk(buyerKey, "offers"),
    "numberOfOffers",
    numberOfOffers
  ); //all-offers-length buyer:id:offers length

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

  //for querying location based on device, hour, day and state
  criteria.device.forEach((device) => client.sadd(device, offerKey));
  criteria.hour.forEach((h) => client.sadd(rk("h", h), offerKey)); //set in format 0 = buyer:id:offers:index
  criteria.day.forEach((d) => client.sadd(rk("d", d), offerKey)); //
  criteria.state.forEach((stat) => client.sadd(stat, offerKey));
};

module.exports = {
  postBuyer,
  getBuyerById,
  getOffer,
};
