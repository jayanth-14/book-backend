const bookModel = require("../models/book_model");
const userModel = require("../models/user_model");

const getCoordinates = async (userId) => {
  const user = await userModel.findOne({ _id: userId });
  return user.location.coordinates;
}

const getLocationNearQuery = async (userId) => {
  const coordinates = await getCoordinates(userId);
  return {
    $geoNear: {
      near: {
        type: "Point",
        coordinates: coordinates,
        maxDistance: 50000,
      },
      distanceField: "distance",
        spherical: true
    }
  }
}

const getBooksNear = async (userId) => {
  const locationQuery = await getLocationNearQuery(userId);
  return await bookModel.find(locationQuery);
}

const getScoreAggregateObject = () => {
  return {
    $addFields: {
      score: {
        $cond: {
          if: { $meta: "textScore" },
          then: { $meta: "textScore" },
          else: 0
        }
      }
    }
  }
}
const getGroupAggregateObject = () => {
  return {
    $group: {
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
    }
  }
}

const getRegxAggregateObject = (SearchQuery) => {
  return {
    $match: {
      $or: [
        { $text: { $search: searchQuery } },
        { title: { $regex: searchQuery, $options: 'i' } },
        { publisher: { $regex: searchQuery, $options: 'i' } },
        { author: { $regex: searchQuery, $options: 'i' } }
      ]
    }
  }
}

const searchBooksWithLocation = async (userId, searchQuery) => {
  const coordinates = await getLocationQuery(userId);
  const groupObject = getGroupAggregateObject();
  const scoreObject = getScoreAggregateObject();
  const locationQuery = getLocationNearQuery(userId);
  const regxQueryObject = getRegxAggregateObject(searchQuery);

  return await bookModel.aggregate([
    locationQuery,
    regxQueryObject,
    groupObject,
    scoreObject,
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

