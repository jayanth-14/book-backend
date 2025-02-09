const { default: mongoose } = require("mongoose");
const {
  getAvailableQuantity,
  getNeededQuantity,
  updateFailedMessage,
  updateQuantity,
  paySeller,
} = require("../database/transactions");
const bookModel = require("../models/book_model");
const transactionModel = require("../models/book_transactions");
const userModel = require("../models/user_model");
const { internalErrorHandler } = require("./common");

const initializeTransaction = async (req, res) => {
  try {
    const transaction = req.body;
    const userId = req.session.userId;
    console.log("transaction body : ", transaction);
    const user = await userModel.findById(userId);
    const book = await bookModel.findById(transaction.bookId);
    const newTransaction = {
      userId: userId,
      transactionDate: new Date(),
      transactionAmount: transaction.amount,
      bookId: transaction.bookId,
      quantity: transaction.quantity,
      sellerId: book.sellerId,
      title: book.title,
      userName: user.fullName,
    };
    const result = await transactionModel.create(newTransaction);
    return result;
  } catch (error) {
    console.log("error at transaction intitializing", error);
    internalErrorHandler(res, error);
  }
};

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
};

const validateQuantity = async (req, res, transactionId, bookId) => {
  const availableQuantity = await getAvailableQuantity(bookId);
  const neededQuantiy = await getNeededQuantity(transactionId);
  if (availableQuantity >= neededQuantiy) {
    return;
  }
  await updateFailedMessage(transactionId, "Needed Quantity not available");
  res.status(400).send({
    status: "failed",
    message: "Needed Quantity not available",
  });
};

const initializePayment = async (amount, seller) => {
  try {
    const gatewayUrl ="http://localhost:3000/" + "init";
    console.log({seller, amount});
    
    const paymentTransaction = await fetch(gatewayUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reciptentEmail: seller,
        amount: amount,
        callbackUrl : "http://localhost:5173/orders",
      }),
    });

    const payment =  await paymentTransaction.json();
    console.log("payment :", payment);
    return payment;
    
  } catch (error) {
    console.log("Error at initiating payment: ", error);
  }
};


const checkout = async (req, res) => {
  try {
    const transaction = await initializeTransaction(req, res);
    console.log("transaction : ", transaction);
    console.log("seller id : ", transaction.sellerId);
    
    console.log("request body : ", req.body);
    
    const seller = await userModel.findById(req.body.sellerId)
    console.log(seller);
    
    await validateQuantity(req, res, transaction._id, transaction.bookId);
    const payment = await initializePayment(
      transaction.transactionAmount,
      seller.email
    );
    console.log("Payment : ", payment);
    
    return res.status(200).send({
      status: "success",
      message: "Transaction completed successfully",
      transactionId: transaction._id,
      transactionLink: payment.transactionLink,
    });
  } catch (error) {
    console.log("error at checkout", error);
    internalErrorHandler(res, error);
  }
};

const delivered = async (req, res) => {
  try {
    const { transactionId } = req.body;
    const transaction = await transactionModel.findById(transactionId);
    console.log(transaction);
    transaction.transactionStatus = "delivered";
    await transaction.save();
    return res.status(200).send({
      status: "success",
      transactionStatus: "delivered",
      message: "Transaction delivered successfully",
    });
  } catch (error) {
    console.log("error at delivered", error);
    
    internalErrorHandler(res, error);
  }
};

const updateCancelled = async (req, res) => {
  try {
    const { transactionId } = req.body;
    const transaction = await transactionModel.findById(transactionId);
    console.log(transaction);
    transaction.transactionStatus = "cancelled";
    await transaction.save();
    return res.status(200).send({
      status: "success",
      transactionStatus: "cancelled",
      message: "Transaction Calcelled successfully",
    });
  } catch (error) {
    console.log("error at cancelling transaction : ", error);
    
    internalErrorHandler(res, error);
  }
};

const getOrders = async (req, res) => {
  try {
    const userId = req.session.userId;
    const orders = await transactionModel.find({ userId: userId });
    res.status(200).send({ status: "success", orders: orders });
  } catch (error) {
    internalErrorHandler(res, error);
  }
};

const getTransactions = async (req, res) => {
  try {
    const userId = req.session.userId;
    const limit = req.query.limit;
    const orders = await transactionModel.find({ sellerId: userId });
    res.status(200).send({ status: "success", trasactions: orders });
  } catch (error) {
    internalErrorHandler(res, error);
  }
};

const updateTransaction = async (req, res) => {
  try {
    const { transactionId, status, message } = req.body;
    const transaction = await transactionModel.findById(transactionId);
    transaction.transactionStatus = status;
    transaction.message = message;
    await transaction.save();
    return res
      .status(200)
      .send({
        status: "success",
        message: "Transaction updated successfully ",
      });
  } catch (error) {
    internalErrorHandler(res, error);
  }
};

module.exports = { checkout, delivered, getOrders, getTransactions, updateTransaction, updateCancelled };
