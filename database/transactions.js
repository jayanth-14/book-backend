const bookModel = require("../models/book_model");
const transactionModel = require("../models/book_transactions");
const userModel = require("../models/user_model");

const getAvailableQuantity = async (bookId) => {
  const book = await bookModel.findById(bookId);
  return book.quantity;
}

const getNeededQuantity = async (transactionId) => {
  const transaction = await transactionModel.findById(transactionId);
  return transaction.quantity;
}

const updateQuantity = async (bookId, quantity) => {
  const book = await bookModel.findById(bookId);
  const newQuantity = book.quantity - quantity;
  await bookModel.updateOne({_id: bookId}, {$set: {quantity: newQuantity}});
}

const getTransactionPrice = async (transactionId) => {
  const transaction  = await transactionModel.findById(transactionId);
  return transaction.price;
}

const updateFailedMessage = async (transactionId, message) => {
  await transactionModel.updateOne({_id: transactionId},{$set: {
    transactionStatus: "failed",
    message: message
  }});
}

const paySeller = async (transactionId) => {
  try {
    const transaction = await transactionModel.findById(transactionId);
    const user = await userModel.findById(transaction.sellerId);
    const amount = transaction.price;
    user.credits = user.credits + amount;
    await user.save();
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  getAvailableQuantity,
  getNeededQuantity,
  updateQuantity,
  getTransactionPrice,
  updateFailedMessage,
  paySeller
}