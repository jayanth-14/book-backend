// importing nessesary handlers
const { inputsErrorHandler, internalErrorHandler } = require("./common");
const userModel = require("../models/user_model");
const bookModel = require("../models/book_model");
const { getSellerDashboardStats } = require("../database/seller");

const userDetailsHandler = async (req, res) => {
  const id = req.params["id"];
  try {
    const data = await userModel.findOne({ _id: id });
    delete data.password;
    res.status(200).json({ status: "success", data });
  } catch (error) {
    return internalErrorHandler(res, error);
  }
};

const profileDetailsHandler = async (req, res) => {
  const userId = req.session.userId;
  try {
    const data = await userModel.findOne({ _id: userId });
    delete data.password;
    res.status(200).json({ status: "success", data });
  } catch (error) {
    return internalErrorHandler(res, error);
  }
};

const getUserLocation = async (req, res) => {
  const userId = req.session.userId;
  try {
    const user = await userModel.findOne({ _id: userId });
    return user.location;
  } catch (error) {
    return internalErrorHandler(res, error);
  }
};

const getAddress = async (req, res) => {
  const userId = req.session.userId;
  try {
    const user = await userModel.findOne({ _id: userId });
    res.status(200).send({ status: "success", address: user.address });
  } catch (error) {
    return internalErrorHandler(res, error);
  }
};

const getMyBooks = async (req, res) => {
  const userId = req.session.userId;
  try {
    const books = await bookModel.find({ sellerId: userId });
    res.status(200).send({ status: "success", books: books });
  } catch (error) {
    return internalErrorHandler(res, error);
  }
};

const getSellerStats = async (req, res) => {
  const userId = req.session.userId;
  try {
    const stats = await getSellerDashboardStats(userId);
    res.status(200).send({stats });
  } catch (error) {
    return internalErrorHandler(res, error);
  }
};

module.exports = {
  userDetailsHandler,
  profileDetailsHandler,
  getUserLocation,
  getAddress,
  getMyBooks,
  getSellerStats
};
