const userModel = require("../models/user_model");
const bookModel = require("../models/book_model");
const { inputsErrorHandler, internalErrorHandler } = require("./common");
const { getUserLocation } = require("./user");
const { getBooksNear, searchBooks } = require("../database/userQueries");



const addBookHandler = async (req, res) => {
  try {
    const { title, author, publishedYear, description, category, condition, price, quantity, imageUrl } = req.body;
    const sellerId = req.session.userId;
    const user = await userModel.findOne({ _id: sellerId });
    const newBook = {
      title, author, publishedYear, description, category, condition, price, quantity,
      sellerId, location: user.location, imageUrl
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
    const { title,author,category } = req.body;
    const books = await bookModel.find({title: title,author: author,category: category});
  
    if (books.length === 0) {
      return res.status(404).json({ status: "error", message: "No books found matching the given criteria." });
    }       
    res.status(200).json( { status: "success", books });
    
    } catch (error) {
    internalErrorHandler(res, error);
  }
};

module.exports = { addBookHandler, getBooksHandler, searchBooksHandler };