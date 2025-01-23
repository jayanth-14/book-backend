const userModel = require("../models/user_model");
const bookModel = require("../models/book_model");
const { inputsErrorHandler, internalErrorHandler } = require("./common");
const { getUserLocation } = require("./user");
const { getBooksNear, searchBooks, searchBooksWithLocation, updateWishList, fetchWishList, getWishListDetails } = require("../database/userQueries");



const addBookHandler = async (req, res) => {
  try {
    const { title, author,publisher, publishedYear, description, category, condition, price, quantity } = req.body;
    const image = req.file.buffer;
    const sellerId = req.session.userId;
    const user = await userModel.findOne({ _id: sellerId });
    const newBook = {
      title, author, publisher, publishedYear, description, category, condition, price, quantity,
      sellerId, location: user.location, image: {data : image}
    }
    const book = await bookModel.create(newBook);
    res.status(201).json({ status: "success", book });
  } catch (error) {
    internalErrorHandler(res, error);
  }
};

const getBooksHandler = async (req, res) => {
  try {
    const id = req.session.userId;
    const books = await getBooksNear(id);
    res.status(200).json({ status: "success", books });
  } catch (error) {
    internalErrorHandler(res, error);
  }
};

const searchBooksHandler = async (req, res) => {
  try {
    const { query, searchBy, condition, category, year } = req.query;
    const userId = req.session.userId;
    const books = await searchBooksWithLocation(userId, query, searchBy, condition, category, year);

    if (books.length === 0) {
      return res.status(204).json({ status: "error", message: "No books found matching the given criteria." });
    }
    res.status(200).json({ status: "success", books });

  } catch (error) {
    internalErrorHandler(res, error);
  }
};

const getBookDetails = async (req, res) => {
  try {
    const bookId = req.params.id;
    const book = await bookModel.findById({ _id: bookId });
    if (!book) {
      inputsErrorHandler(res, "Book not found");
    }
    res.status(200).json({ status: "success", book });
  }
  catch (error) {
    internalErrorHandler(res, error);
  }
};

const getWishList = async (req, res) => {
  try {
    const userId = req.session.userId;
    const wishList = await fetchWishList(userId);
    const wishListDetails = await getWishListDetails(wishList);
    res.status(200).json({ status: "success", wishList : wishListDetails });
  } catch (error) {
    internalErrorHandler(res, error)
  }
}

const addToWishList = async (req, res) => {
  try {
    const userId = req.session.userId;
    const bookId = req.body.bookId;
    const status = await updateWishList(userId, bookId);
    res.status(200).json({ status: "success", details : status });
  } catch (error) {
    internalErrorHandler(res, error)
  }
}

module.exports = { addBookHandler, getBooksHandler, searchBooksHandler, getBookDetails, getWishList, addToWishList }; 
