const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const getCoordsFromAddress = require('../utils/location');
const Place = require('../models/place');
const User = require('../models/user');
const HttpError = require('../models/http-error');

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
  const places = await Place.find().exec();
  res.status(200).json({ places });
};

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.placeId;
  let place;
  try {
    place = await Place.findById(placeId).exec();
  } catch (error) {
    const err = new HttpError('Something went wrong, try again', 500);
    next(err);
  }

  if (!place) {
    const error = new HttpError(
      'Could not find place for the provided ID',
      404
    );
    return next(error);
  }
  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUser = async (req, res, next) => {
  const userId = req.params.userId;
  let places;
  try {
    places = await Place.find({ creator: userId }).exec();
  } catch (error) {
    const err = new HttpError('Something went wrong, try again', 500);
    return next(err);
  }
  if (!places || places.length === 0) {
    return next(
      new HttpError('Could not find places for the provided user ID', 404)
    );
  }
  res.json({
    places: places.map((place) => place.toObject({ getters: true })),
  });
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

  let user;

  try {
    user = await User.findById(creator);
  } catch (error) {
    const err = new HttpError('Failed to save plave', 500);
    return next(err);
  }

  if (!user) {
    const error = new HttpError('User dont exist', 404);
    return next(error);
  }

  try {
    const sessn = await mongoose.startSession();
    sessn.startTransaction();
    await createdPlace.save({ session: sessn });
    user.places.push(createdPlace);
    await user.save({ session: sessn });
    await sessn.commitTransaction();
  } catch (err) {
    const error = new HttpError('Failed to save plave', 500);
    return next(error);
  }
  res.status(201).json({ createdPlace: createdPlace.toObject({getters:true}) });
};

const updatePlaceById = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Bad Request, Invalid values', 400));
  }
  const { title, description } = req.body;
  const placeId = req.params.placeId;

  let place;
  try {
    place = await Place.findById(placeId).exec();
  } catch (error) {
    const err = new HttpError('Something went wrong', 500);
    return next(err);
  }
  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (error) {
    const err = new Error('Could not update place', 500);
    return next(err);
  }
  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.placeId;
  let place;
  try {
    place = await Place.findById(placeId).exec();
  } catch (error) {
    const err = new HttpError('Something went wrong, try again', 500);
    return next(err);
  }
  try {
    await place.remove();
  } catch (error) {
    const err = new HttpError('Something went wrong, try again', 500);
    return next(err);
  }
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
