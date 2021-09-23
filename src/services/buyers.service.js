require('dotenv').config()
const rk = require('rk')
const createClient = require('../redis')
const {
  validateBuyer,
  validateCriteria
} = require('../utils/validation/model_validators')
const {
  NotFoundException,
  UnprocessableEntityException,
  InternalServerException
} = require('../utils/exception_filters/http_exceptions')

const client = createClient(process.env.REDIS_PORT, process.env.HOST, {
  fast: true
})

const postBuyer = async (buyer) => {
  if (!buyer || Object.keys(buyer).length === 0) {
    throw new NotFoundException()
  }
  const validationResult = await validateBuyer(buyer)
  if (validationResult.error) {
    throw new UnprocessableEntityException(validationResult.error)
  }
  saveBuyer(buyer)
}

const getBuyerById = async (id) => {
  const buyerExists = await client.sismemberAsync('all-buyers', id)
  if (!buyerExists) {
    throw new NotFoundException(`There are no buyers with the id ${id}`)
  }
  const buyerKey = rk('buyer', id)
  const offersKey = rk(buyerKey, 'offers')
  let counter = 0

  const offersCountString = await client.hmgetAsync(
    'all-offers-length',
    offersKey
  )
  const offersCount = parseInt(offersCountString[0])

  const offersArray = []
  while (counter < offersCount) {
    const offerKey = rk(buyerKey, 'offers', counter)
    const offer = await client.hmgetAsync(
      offerKey,
      'value',
      'location',
      'criteria'
    )

    const tempDevice = await client.smembersAsync(rk(offer[2], 'device'))
    const tempHour = await client.smembersAsync(rk(offer[2], 'hour'))
    const tempDay = await client.smembersAsync(rk(offer[2], 'day'))
    const tempState = await client.smembersAsync(rk(offer[2], 'state'))
    const tempOffer = {
      criteria: {
        device: JSON.parse(tempDevice),
        hour: tempHour.map((x) => parseInt(x)).sort((a, b) => a - b),
        day: tempDay.map((x) => parseInt(x)).sort((a, b) => a - b),
        state: JSON.parse(tempState)
      },
      value: parseInt(offer[0]),
      location: offer[1]
    }
    offersArray.push(tempOffer)
    counter++
  }
  const buyer = {
    id: id,
    offers: offersArray
  }
  const validationResult = await validateBuyer(buyer)
  if (validationResult.error) {
    throw new InternalServerException(validationResult.error)
  }
  return buyer
}

const getOffer = async (hour, day, device, state) => {
  const validationResult = await validateCriteria({
    device: [device],
    hour: [hour],
    day: [day],
    state: [state]
  })
  if (validationResult.error) {
    throw new UnprocessableEntityException(validationResult.error)
  }
  const offerKeys = await client.sinterAsync([
    rk('h', hour),
    rk('d', day),
    device,
    state
  ])
  if (offerKeys.length === 0) {
    throw new NotFoundException('There are no offers for those parameters')
  }
  const result = await Promise.all(
    offerKeys.map(async (key) => {
      return await client.hmgetAsync(key, 'location', 'value')
    })
  )
  result.sort((a, b) => b[1] - a[1])
  return result[0][0]
}

const saveBuyer = (buyer) => {
  const buyerKey = rk('buyer', buyer.id)
  const numberOfOffers = buyer.offers.length
  client.sadd('all-buyers', buyer.id)

  client.hmset(
    'all-offers-length',
    rk(buyerKey, 'offers'),
    numberOfOffers
  )

  saveBuyersOffers(buyer.offers, buyerKey)
}

const saveBuyersOffers = (offers, buyerKey) => {
  offers.forEach((offer, index) => {
    const offerKey = rk(buyerKey, 'offers', index)

    client.hmset(
      offerKey,
      'value',
      offer.value,
      'location',
      offer.location,
      'criteria',
      rk(offerKey, 'criteria')
    )

    saveBuyersOffersCriteria(offer.criteria, offerKey)
  })
}

const saveBuyersOffersCriteria = (criteria, offerKey) => {
  const criteriaKey = rk(offerKey, 'criteria')

  client.sadd(rk(criteriaKey, 'device'), JSON.stringify(criteria.device))
  client.sadd(rk(criteriaKey, 'hour'), criteria.hour)
  client.sadd(rk(criteriaKey, 'day'), criteria.day)
  client.sadd(rk(criteriaKey, 'state'), JSON.stringify(criteria.state))

  criteria.device.forEach((device) => client.sadd(device, offerKey))
  criteria.hour.forEach((h) => client.sadd(rk('h', h), offerKey))
  criteria.day.forEach((d) => client.sadd(rk('d', d), offerKey))
  criteria.state.forEach((stat) => client.sadd(stat, offerKey))
}

module.exports = {
  postBuyer,
  getBuyerById,
  getOffer
}
