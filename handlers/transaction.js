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
    // console.log("transaction body : ", transaction);
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
    console.log(result);
    
    return result;
  } catch (error) {
    console.log("error at transaction intitializing", error);
    internalErrorHandler(res, error);
  }
};


const validateQuantity = async (req, res, transactionId, bookId) => {
  const availableQuantity = await getAvailableQuantity(bookId);
  const neededQuantiy = await getNeededQuantity(transactionId);
  if (availableQuantity >= neededQuantiy) {
    return undefined;
  }
  await updateFailedMessage(transactionId, "Needed Quantity not available");
  return {
    status: "failed",
    message: "Needed Quantity not available",
  };
};

const initializePayment = async (amount, seller) => {
  try {
    const gatewayUrl =  process.env.PAYEMENT + "init";
    console.log({seller, amount});
    console.log(seller);
    
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
    const seller = await userModel.findById(req.body.sellerId)
    
    const quantityValidation = await validateQuantity(req, res, transaction._id, transaction.bookId);
    if (quantityValidation !== undefined) {
      return res.status(201).send(quantityValidation);
    }
    console.log("seller : ", transaction.sellerId);
    
    const payment = await initializePayment(
      transaction.transactionAmount,
      seller.email,
    );
    console.log("Payment : ", payment);
    transaction.paymentId = payment.transaction._id;
    transaction.userName = seller.fullName;
    await transaction.save();
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
    console.log("Crediting in process");
    
    const response = await fetch(process.env.PAYEMENT+'credit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        transaction_id: transaction.paymentId
      })
    })
    const data = await response.json();
    const bookId = transaction.bookId;
    const book = await bookModel.findById(bookId);
    book.quantity -= transaction.quantity;
    await book.save();
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
    const { transactionId, message } = req.body;
    
    const transaction = await transactionModel.findById(transactionId);
    
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    console.log("Transaction found:", transaction);

    transaction.transactionStatus = "cancelled";
    transaction.message = message;
    await transaction.save();

    console.log("Transaction updated locally, calling payment gateway...");

    const response = await fetch(`${process.env.PAYEMENT}cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ transaction_id: transaction.paymentId })
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Payment service error:", result);
      return res.status(500).json({ message: "Payment cancellation failed", error: result });
    }

    console.log("Payment cancellation success:", result);

    return res.status(200).json({
      status: "success",
      transactionStatus: "cancelled",
      message: "Transaction cancelled successfully",
    });

  } catch (error) {
    console.error("Error at cancelling transaction:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
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

const getDeliveries = async (req, res) => {
  try {
    const userId = req.session.userId;
    const deliveries = await transactionModel.find({ sellerId: userId });
    res.status(200).send({ status: "success", deliveries });
  } catch (error) {
    internalErrorHandler(res, error);
  }
}

const getTransactionDetails = async (req, res) => {
  try {
    const transactionId = req.params.id;
    const transaction = await transactionModel.findById(transactionId);
    const seller = await userModel.findById(transaction.sellerId);
    const book = await bookModel.findById(transaction.bookId);
    const buyer = await userModel.findById(transaction.userId);
    res.status(200).send({ status: "success", transaction, seller, buyer, book });
  } catch (error) {
    internalErrorHandler(res, error);
  }
}

module.exports = { checkout, delivered, getOrders, getTransactionDetails, getTransactions, updateTransaction, updateCancelled, getDeliveries };
