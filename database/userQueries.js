const bookModel = require("../models/book_model");
const userModel = require("../models/user_model");

const getCoordinates = async (userId) => {
  const user = await userModel.findOne({ _id: userId });
  return user.location.coordinates;
};

const searchBooksWithLocation = async (
  userId,
  searchQuery,
  searchBy,
  category,
  condition,
  year
) => {
  const coordinates = await getCoordinates(userId);

  // Build match conditions
  const matchConditions = {};

  // Add search condition
  if (searchQuery) {
    if (searchBy.toLowerCase() === "all") {
      // When searchBy is "All", we search across multiple fields
      matchConditions.$or = [
        { title: { $regex: searchQuery, $options: "i" } },
        { author: { $regex: searchQuery, $options: "i" } },
        { publisher: { $regex: searchQuery, $options: "i" } },
        { description: { $regex: searchQuery, $options: "i" } },
      ];
    } else if (searchBy.toLowerCase() === "title") {
      matchConditions.title = { $regex: searchQuery, $options: "i" };
    } else if (searchBy.toLowerCase() === "author") {
      matchConditions.author = { $regex: searchQuery, $options: "i" };
    } else if (searchBy.toLowerCase() === "publisher") {
      matchConditions.publisher = { $regex: searchQuery, $options: "i" };
    }
  }

  // Add other filters
  if (category && category.toLowerCase() !== "all") {
    matchConditions.category = category;
  }
  if (condition && condition.toLowerCase() !== "all") {
    matchConditions.condition = condition;
  }
  if (year && year.toLowerCase() !== "all") {
    matchConditions.publishedYear = year;
  }

  const pipeline = [
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: coordinates,
        },
        distanceField: "distance",
        maxDistance: 5000000,
        spherical: true,
        query: matchConditions, // Here we are applying the match conditions to only get books which match our search query
      },
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
        distance: 1,
        image: 1,
      },
    },
    // We are sorting the books / collection based on the distance. i.e. we get books near us first
    {
      $sort: {
        distance: 1,
      },
    },
    // we are temperyly limiting the response to 20 books / collection, and In future we implement paging we work on this
    // {
    //   $limit: 20,
    // },
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
          coordinates: coordinates,
        },
        distanceField: "distance",
        maxDistance: 5000000,
        spherical: true,
      },
    },
    {
      $match: {
        sellerId: { $ne: userId },
      },
    },
    // {
    //   $skip: offset,
    // },
    // {
    //   $limit: limit,
    // },
    {
      $project: {
        title: 1,
        author: 1,
        publisher: 1,
        distance: 1,
        price: 1,
        image: '$image'
      },
    },
  ]);
};

// code / logic for wishlist adding

const fetchWishList = async (userId) => {
  const data = await userModel.findOne({ _id: userId }).select("wishlist");
  return data.wishlist;
};

const getWishListDetails = async (list) => {
  const wishlist = [];
  const bookPromises = list.map((bookId) =>
    bookModel
      .findOne({ _id: bookId })
      .select(["_id", "title", "author", "price", "image"])
  );

  const books = await Promise.all(bookPromises);

  books.forEach((book) => {
    if (book) {
      wishlist.push(book);
    }
  });

  return wishlist;
};

const addBookToWishList = async (userId, bookId) => {
  return await userModel.updateOne(
    { _id: userId },
    { $addToSet: { wishlist: bookId } }
  );
};

const removeBookFromWishlist = async (userId, bookId) => {
  return await userModel.updateOne(
    { _id: userId },
    { $pull: { wishlist: bookId } }
  );
}

module.exports = {
  getBooksNear,
  searchBooksWithLocation,
  fetchWishList,
  addBookToWishList,
  getWishListDetails,
  removeBookFromWishlist,
};
