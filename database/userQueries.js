const bookModel = require("../models/book_model");
const userModel = require("../models/user_model");

const getCoordinates = async (userId) => {
  const user = await userModel.findOne({ _id: userId });
  return user.location.coordinates;
};

const searchBooksWithLocation = async (userId, searchQuery, searchBy, category, condition, year) => {
  const coordinates = await getCoordinates(userId);
  
  // Build match conditions
  const matchConditions = {};
  
  // Add search condition 
  if (searchQuery) {
    if (searchBy.toLowerCase() === 'all') {
      // When searchBy is "All", we search across multiple fields
      matchConditions.$or = [
        { title: { $regex: searchQuery, $options: 'i' } },
        { author: { $regex: searchQuery, $options: 'i' } },
        { publisher: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } }
      ];
    }else if (searchBy === 'title') {
      matchConditions.title = { $regex: searchQuery, $options: 'i' };
    } else if (searchBy === 'author') {
      matchConditions.author = { $regex: searchQuery, $options: 'i' };
    } else if (searchBy === 'publisher') {
      matchConditions.publisher = { $regex: searchQuery, $options: 'i' };
    }
  }

  // Add other filters
  if (category && category.toLowerCase() !== 'all') {
    matchConditions.category = category;
  }
  if (condition && condition.toLowerCase() !== 'all') {
    matchConditions.condition = condition;
  }
  if (year && year.toLowerCase() !== 'all') {
    matchConditions.publishedYear = year;
  }

  const pipeline = [
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: coordinates
        },
        distanceField: "distance",
        maxDistance: 50000,
        spherical: true,
        query: matchConditions // Here we are applying the match conditions to only get books which match our search query
      }
    },
    // here we are specifing what fields we want
    {
      $project: {
        title: 1,
        author: 1,
        publisher: 1,
        publishedYear: 1,
        description: 1,
        category: 1,
        condition: 1,
        price: 1,
        quantity: 1,
        distance: 1
      }
    },
    // We are sorting the books / collection based on the distance. i.e. we get books near us first
    {
      $sort: {
        distance: 1
      }
    },
    // we are temperyly limiting the response to 20 books / collection, and In future we implement paging we work on this
    {
      $limit: 20
    }
  ];

  return await bookModel.aggregate(pipeline);
};

const getBooksNear = async (userId) => {
  const coordinates = await getCoordinates(userId);
  
  return await bookModel.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: coordinates
        },
        distanceField: "distance",
        maxDistance: 50000,
        spherical: true
      }
    },
    {
      $project: {
        title: 1,
        author: 1,
        publisher: 1,
        distance: 1
      }
    },
    {
      $limit: 20
    }
  ]);
};

module.exports = { getBooksNear, searchBooksWithLocation };