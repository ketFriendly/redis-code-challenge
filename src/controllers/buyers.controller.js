const buyersService = require('../services/buyers.service');

const addBuyer = async (req, res) => {
  try {
    return res.status(200).json(await buyersService.postBuyer(req.body));
  } catch (error) {
    console.log(error);
    return res.status(error.code).json(error.message);
  }
};

const getBuyer = async (req, res) => {
  try {
    return res
      .status(200)
      .json(await buyersService.getBuyerById(req.params.id));
  } catch (error) {
    console.log(error);
    return res.status(error.code).json(error.message);
  }
};

const routeTraffic = async (req, res) => {
  try {
    const dt = new Date(req.query.timestamp);
    const redirectUrl = await buyersService.getOffer(
      dt.getHours(),
      dt.getDay(),
      req.query.device,
      req.query.state
    );
    res.writeHead(302, { Location: redirectUrl });
    res.end();
  } catch (error) {
    console.log(error);
    return res.status(error.code).json(error.message);
  }
};

module.exports = {
  addBuyer,
  getBuyer,
  routeTraffic,
};
