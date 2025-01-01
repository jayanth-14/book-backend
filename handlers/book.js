const userModel = require("../models/user_model");
const bookModel = require("../models/book_model");
const { inputsErrorHandler, internalErrorHandler } = require("./common");
const { getUserLocation } = require("./user");



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
    const {coordinates} = await getUserLocation(req, res);
    const books = await bookModel.find({
      location: {
       $near: {
        $maxDistance: 50000, // distance in meters
        $geometry: {
         type: "Point",
         coordinates: coordinates
        }
       }
      }
     });
    res.status(200).json({ status: "success", books });
  } catch (error) {
    internalErrorHandler(res, error);
  }
};

module.exports = { addBookHandler, getBooksHandler };