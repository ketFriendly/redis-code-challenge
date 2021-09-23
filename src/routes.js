const express = require('express')
const router = express.Router()

const {addBuyer, getBuyer, routeTraffic} = require('../src/controllers/buyers.controller')

router.post('/buyers', addBuyer)

router.get('/buyers/:id', getBuyer)

router.get('/route', routeTraffic)

module.exports = router
