const HttpError = require('../models/http-error');

const DUMMY_PLACES = [
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
    creator: 'u1',
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

const getPlaceById = (req, res, next) => {
  const placeId = req.params.placeId;
  const place = DUMMY_PLACES.find((p) => {
    return p.id === placeId;
  });
  if (!place) {
    throw new HttpError('Could not find place', 404);
  }
  res.json({ place });
};

const getPlaceByUser = (req, res, next) => {
  const userId = req.params.userId;
  const places = DUMMY_PLACES.find((p) => {
    return p.creator === userId;
  });
  if (!places) {
    next(new HttpError('Could not find places for the user', 404));
  }
  res.json({ places });
};

exports.getPlaceById = getPlaceById
exports.getPlaceByUser = getPlaceByUser