
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

const routeTraffic = async (req,res) => {
    try {
        const dt = new Date(req.query.timestamp);
        return res.json(await buyersService.getOffer(dt.getHours(), dt.getDay(), req.query.device))
    } catch (error) {
        console.log(error)
    }
}
module.exports = {
    addBuyer,
    getBuyer,
    routeTraffic
}
