const bookModel = require("../models/book_model");
const userModel = require("../models/user_model");

const getLocationNearQuery = async (userId) => {
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
  const locationQuery = await getLocationNearQuery(userId);
  return await bookModel.find(locationQuery);
}

const getLocationQuery = async (userId) => {
  const user = await userModel.findOne({ _id: userId });
  return user.location.coordinates;
}

const searchBooksWithLocation = async (userId, searchQuery) => {
  const coordinates = await getLocationQuery(userId);
  const groupObject = {
    _id: "$_id",
    title: { $first: "$title" },
    author: { $first: "$author" },
    publisher: { $first: "$publisher" },
    publishedYear: { $first: "$publishedYear" },
    description: { $first: "$description" },
    category: { $first: "$category" },
    condition: { $first: "$condition" },
    price: { $first: "$price" },
    quantity: { $first: "$quantity" },
    distance: { $first: "$distance" },
    score: { $first: "$score" }
  };

  return await bookModel.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: coordinates
        },
        distanceField: "distance",
        spherical: true
      }
    },
    {
      $match: {
        $or: [
          { $text: { $search: searchQuery } },
          { title: { $regex: searchQuery, $options: 'i' } },
          { publisher: { $regex: searchQuery, $options: 'i' } },
          { author: { $regex: searchQuery, $options: 'i' } }
        ]
      }
    },
    {
      $addFields: {
        score: {
          $cond: {
            if: { $meta: "textScore" },
            then: { $meta: "textScore" },
            else: 0
          }
        }
      }
    },
    {
      $group: groupObject
    },
    {
      $sort: {
        score: -1,
        distance: 1
      }
    },
    {
      $limit: 20
    }
  ]);
}

module.exports = { getBooksNear, searchBooksWithLocation };

