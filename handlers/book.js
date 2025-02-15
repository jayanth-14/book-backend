const userModel = require("../models/user_model");
const bookModel = require("../models/book_model");
const { inputsErrorHandler, internalErrorHandler } = require("./common");
const { getUserLocation } = require("./user");
const {
  getBooksNear,
  searchBooks,
  searchBooksWithLocation,
  updateWishList,
  fetchWishList,
  getWishListDetails,
  addBookToWishList,
  removeBookFromWishlist,
} = require("../database/userQueries");

const addBookHandler = async (req, res) => {
  try {
    const {
      title,
      author,
      publisher,
      publishedYear,
      description,
      category,
      condition,
      price,
      quantity,
    } = req.body;
    const image = req.file.buffer;
    const sellerId = req.session.userId;
    const user = await userModel.findOne({ _id: sellerId });
    const newBook = {
      title,
      author,
      publisher,
      publishedYear,
      description,
      category,
      condition,
      price,
      quantity,
      sellerId,
      location: user.location,
      image: { data: image },
    };
    const book = await bookModel.create(newBook);
    res.status(201).json({ status: "success", book });
  } catch (error) {
    internalErrorHandler(res, error);
  }
};

const getBooksHandler = async (req, res) => {
  try {
    const id = req.session.userId;
    const offset = req.query.offset;
    const limit = req.query.limit;
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
    const books = await searchBooksWithLocation(
      userId,
      query,
      searchBy,
      condition,
      category,
      year
    );

    if (books.length === 0) {
      return res
        .status(204)
        .json({
          status: "error",
          message: "No books found matching the given criteria.",
        });
    }
    res.status(200).json({ status: "success", books });
  } catch (error) {
    internalErrorHandler(res, error);
  }
};

const getBookDetails = async (req, res) => {
  try {
    const userId = req.session.userId;
    const bookId = req.params.id;
    const user = await userModel.findById(userId);
    const book = await bookModel.findById({ _id: bookId });
    if (!book) {
      inputsErrorHandler(res, "Book not found");
    }
    const isWishlist = user.wishlist.includes(bookId);
    const isOwnedBook = book.sellerId === userId;
    const bookDetails = {
      _id : book._id,
      title : book.title,
      author : book.author,
      price : book.price,
      description : book.description,
      category : book.category,
      condition: book.condition,
      edition : book.edition,
      publisher: book.publisher,
      quantity : book.quantity,
      image : book.image,
      isWishlist: isWishlist,
      isOwnedBook: isOwnedBook,
    };
    res.status(200).json({ status: "success", book: bookDetails });
  } catch (error) {
    internalErrorHandler(res, error);
  }
};

const getWishList = async (req, res) => {
  try {
    const userId = req.session.userId;
    const wishList = await fetchWishList(userId);
    const wishListDetails = await getWishListDetails(wishList);
    res.status(200).json({ status: "success", wishList: wishListDetails });
  } catch (error) {
    internalErrorHandler(res, error);
  }
};

const addToWishList = async (req, res) => {
  try {
    const userId = req.session.userId;
    const bookId = req.body.bookId;
    const status = await addBookToWishList(userId, bookId);
    res.status(200).json({ status: "success", details: status });
  } catch (error) {
    internalErrorHandler(res, error);
  }
};

const removeFromWishlist  = async (req, res) => {
  try {
    const userId = req.session.userId;
    const bookId = req.body.bookId;
    const status = await removeBookFromWishlist(userId, bookId);
    res.status(200).json({ status: "success", details: status });
  } catch (error) {
    internalErrorHandler(res, error);
  }
};

module.exports = {
  addBookHandler,
  getBooksHandler,
  searchBooksHandler,
  getBookDetails,
  getWishList,
  addToWishList,
  removeFromWishlist
};
