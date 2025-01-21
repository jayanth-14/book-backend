const { getAvailableQuantity, getNeededQuantity, updateFailedMessage, updateQuantity, paySeller } = require("../database/transactions");
const bookModel = require("../models/book_model");
const transactionModel = require("../models/book_transactions");
const userModel = require("../models/user_model");
const { internalErrorHandler } = require("./common");

const initializeTransaction = async (req, res) => {
  try {
    const transaction = req.body;
    const userId = req.session.userId;
    const newTransaction = {
      userId: userId,
      transactionDate: new Date(),
      transactionAmount: transaction.amount,
      bookId: transaction.bookId,
      quantity: transaction.quantity,
      sellerId : transaction.sellerId,
      title: transaction.title
    }
    const result = await transactionModel.create(newTransaction);
    return result;
  } catch (error) {
    internalErrorHandler(res, error)
  }
}

const validateUserCredits = async (req, res, userId, transactionId) => {
  try {
    const { amount } = req.body;
    const user = await userModel.findById(userId);
    if (user.credits >= amount) {
      return;
    }
    updateFailedMessage(transactionId, "user credits are in-sufficient");
    res.status(400).send({
      status: "failed",
      message: "user credits are in-sufficient",
      credits: user.credits,
    });

  } catch (error) {
    internalErrorHandler(res, error);
  }
}

const validateQuantity = async (req, res, transactionId, bookId) => {
  const availableQuantity = await getAvailableQuantity(bookId);
  const neededQuantiy = await getNeededQuantity(transactionId);
  if (availableQuantity >= neededQuantiy) {
    return;
  }
  await updateFailedMessage(transactionId, "Needed Quantity not available");
  res.status(400).send({
    status: "failed",
    message: "Needed Quantity not available"
  });
}

const deductCredits = async (userId, transactionId) => {
  try {
    const transaction = await transactionModel.findById(transactionId);
    const price = transaction.transactionAmount;
    const user = await userModel.findById(userId);
    user.credits -= price;
    transaction.transactionStatus = "paid";
    await transaction.save();
    return;
  } catch (error) {
    throw new Error(error);
  }
}

const checkout = async (req, res) => {
  try {
    const transaction = await initializeTransaction(req, res);
    const userId = req.session.userId;
    await validateUserCredits(req, res, userId, transaction._id);
    await validateQuantity(req, res, transaction._id, transaction.bookId);
    await deductCredits(userId, transaction._id);
    await updateQuantity(transaction.bookId, transaction.quantity);
    return res.status(200).send({
      status: "success",
      message: "Transaction completed successfully",
      transactionId: transaction._id
    });
  } catch (error) {
    internalErrorHandler(res, error)
  }
}

const delivered = async (req, res) => {
  try {
    const { transactionId } = req.body;
    const transaction = await transactionModel.findById(transactionId);
    transaction.transactionStatus = "delivered";
    await transaction.save();
    await paySeller(transactionId)
    return res.status(200).send({
      status: 'success',
      transactionStatus: "delivered",
      message: "Transaction delivered successfully",
    });
  } catch (error) {
    internalErrorHandler(res, error)
  }
}

const getOrders = async (req, res) => {
  try {
    const userId = req.session.userId;
    const orders = await transactionModel.find({userId:userId});
    res.status(200).send({status: 'success', orders: orders});
  } catch (error) {
    internalErrorHandler(res, error);
  }
}

module.exports = { checkout, delivered, getOrders }