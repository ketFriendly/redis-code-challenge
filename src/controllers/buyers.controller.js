
const buyersService = require('../services/buyers.service');

const addBuyer = async (req, res) => {
    try {
        return res.json(await buyersService.postBuyer(req.body))      
    } catch (error) {
        console.log(error)
    }
}

const getBuyer = async (req,res) => {
    try {
        return res.json(await buyersService.getBuyerById(req.params.id))
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    addBuyer,
    getBuyer
}
/* 
routeTraffic */