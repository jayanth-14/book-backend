const bookModel = require("../models/book_model");
const userModel = require("../models/user_model");

const getLocationQuery = async (userId) => {
  const user = await userModel.findOne({ _id: userId });
  const coordinates = user.location.coordinates;
  return {
    location: {
      $near: {
        $maxDistance: 50000, // distance in meters
        $geometry: {
          type: "Point",
          coordinates: coordinates
        }
      }
    }
  };
}

const getBooksNear = async (userId) => {
  const locationQuery = await getLocationQuery(userId);
  return await bookModel.find(locationQuery);
}

const searchBooks = async (userId, query) => {
  const locationQuery = await getLocationQuery(userId);
  const books = await bookModel.find({locationQuery }).find({ $text: { $search: query } });
  return books;
}

module.exports = { getBooksNear, searchBooks };
