const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const getCoordsFromAddress = require('../utils/location');
const Place = require('../models/place');
const User = require('../models/user');
const HttpError = require('../models/http-error');


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
    image:
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
    place = await Place.findById(placeId).populate('creator');
  } catch (error) {
    const err = new HttpError('Something went wrong, try again', 500);
    return next(err);
  }

  if(!place){
    return next(new HttpError('Place for the provided ID doesnt exist',404))
  }

  try {
    const sessn = await mongoose.startSession()
    sessn.startTransaction()
    await place.remove({session: sessn})
    place.creator.places.pull(place)
    await place.creator.save({session: sessn})
    await sessn.commitTransaction()
  } catch (error) {
    const err = new HttpError('Something went wrong, try again', 500);
    return next(err);
  }
  res
    .status(200)
    .json({ message: `Place with id: ${placeId} has been deleted` });
};

exports.getAllPlaces = getAllPlaces;
exports.getPlaceById = getPlaceById;
exports.getPlacesByUser = getPlacesByUser;
exports.createPlace = createPlace;
exports.updatePlaceById = updatePlaceById;
exports.deletePlace = deletePlace;
