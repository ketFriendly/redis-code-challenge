const buyersService = require('../services/buyers.service');

const addBuyer = async (req, res) => {
    try {
        return buyersService.postBuyer(req.body)
    } catch (error) {
        console.log(error)
    }
}
module.exports = {
    addBuyer
}
/* getBuyer
routeTraffic */