const buyersService = require('../services/buyers.service')

const addBuyer = async (req, res) => {
  try {
    await buyersService.postBuyer(req.body)
    return res.status(201).json({})
  } catch (error) {
    console.log(error)
    return res.status(error.code).json({})
  }
}

const getBuyer = async (req, res) => {
  try {
    const buyer = await buyersService.getBuyerById(req.params.id)
    return res.status(200).json({buyer})
  } catch (error) {
    console.log(error)
    return res.status(error.code).json({})
  }
}

const routeTraffic = async (req, res) => {
  try {
    const dt = new Date(req.query.timestamp)
    const minutes = dt.getMinutes()
    let hours = dt.getHours()
    if (minutes >= 30 && hours !== 0) hours = hours - 1
    if (minutes >= 30 && hours === 0) hours = 23
    const redirectUrl = await buyersService.getOffer(
      hours,
      dt.getDay(),
      req.query.device,
      req.query.state
    )
    res.writeHead(302, { Location: redirectUrl })
    res.end()
  } catch (error) {
    console.log(error)
    return res.status(error.code).json({})
  }
}

module.exports = {
  addBuyer,
  getBuyer,
  routeTraffic
}
