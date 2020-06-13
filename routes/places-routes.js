const express = require('express');

const placesControllers = require('../controllers/places-controllers')

const router = express.Router();

router.get('/:placeId', placesControllers.getPlaceById );

router.get('/user/:userId', placesControllers.getPlaceByUser);

module.exports = router;
