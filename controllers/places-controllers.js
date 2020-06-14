const HttpError = require('../models/http-error');

const { validationResult } = require('express-validator');
const getCoordsFromAddress = require('../utils/location');
const Place = require('../models/place');

let DUMMY_PLACES = [
  {
    id: 'pl1',
    title: 'Burj Khalifa',
    imageUrl:
      'https://images.unsplash.com/photo-1526495124232-a04e1849168c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1868&q=80',
    description:
      'Spired 828-meter skyscraper with a viewing deck, restaurant, hotel and offices and 11-hectare park.',
    address:
      '1 Sheikh Mohammed bin Rashid Blvd - Downtown Dubai - Dubai - United Arab Emirates',
    location: {
      lat: 25.197197,
      lng: 55.2743764,
    },
    creator: 'u2',
  },
  {
    id: 'pl2',
    title: 'Empire State Building',
    imageUrl:
      'https://images.unsplash.com/photo-1550664890-c5e34a6cad31?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1950&q=80',
    description:
      'Iconic, art deco office tower from 1931 with exhibits & observatories on the 86th & 102nd floors.',
    address: '20 W 34th St, New York, NY 10001, United States',
    location: {
      lat: 40.7484405,
      lng: -73.9856644,
    },
    creator: 'u2',
  },
];

const getAllPlaces = async (req, res, next) => {
  const places = await Place.find().exec()
  res.status(200).json({places})
};

const getPlaceById = (req, res, next) => {
  const placeId = req.params.placeId;
  const place = DUMMY_PLACES.find((p) => {
    return p.id === placeId;
  });
  if (!place) {
    throw new HttpError('Could not find place for the provided ID', 404);
  }
  res.json({ place });
};

const getPlacesByUser = (req, res, next) => {
  const userId = req.params.userId;
  const places = DUMMY_PLACES.filter((p) => {
    return p.creator === userId;
  });
  if (!places || places.length === 0) {
    next(new HttpError('Could not find places for the provided user ID', 404));
  }
  res.json({ places });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(new HttpError('Bad request, check your values', 400));
  }

  const { title, description, address, creator } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordsFromAddress(address);
  } catch (error) {
    return next(error);
  }

  const createdPlace = new Place({
    title,
    description,
    imageUrl:
      'https://images.unsplash.com/photo-1550664890-c5e34a6cad31?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1950&q=80',
    location: coordinates,
    address,
    creator,
  });

  try {
    await createdPlace.save();
  } catch (err) {
    const error = new HttpError('Failed to save plave', 500);
    return next(error);
  }
  res.status(201).json({ createdPlace });
};

const updatePlaceById = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new HttpError('Bad Request, Invalid values', 400);
  }
  const { title, description } = req.body;
  const placeId = req.params.placeId;
  const updatedPlace = DUMMY_PLACES.find((p) => {
    return p.id === placeId;
  });
  const placeIndex = DUMMY_PLACES.findIndex((p) => {
    return p.id === placeId;
  });
  updatedPlace.title = title;
  updatedPlace.description = description;

  DUMMY_PLACES[placeIndex] = updatedPlace;

  res.status(200).json({ place: updatedPlace });
};

const deletePlace = (req, res, next) => {
  const placeId = req.params.placeId;
  if (
    !DUMMY_PLACES.find((p) => {
      p.id === placeId;
    })
  ) {
    throw new HttpError('Place does not exist', 404);
  }
  DUMMY_PLACES = DUMMY_PLACES.filter((p) => {
    return p.id !== placeId;
  });
  res
    .status(200)
    .json({ message: `Item with id: ${placeId} has been deleted` });
};

exports.getAllPlaces = getAllPlaces;
exports.getPlaceById = getPlaceById;
exports.getPlacesByUser = getPlacesByUser;
exports.createPlace = createPlace;
exports.updatePlaceById = updatePlaceById;
exports.deletePlace = deletePlace;
