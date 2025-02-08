const { default: mongoose } = require("mongoose");
const bookModel = require("../models/book_model");
const transactionModel = require("../models/book_transactions");

const getBooksStats = async (id) => {
  const sellerId = new mongoose.Types.ObjectId(id);
  try {
    const stats = await bookModel.aggregate([
      {
        $match: { sellerId: sellerId }
      },
      {
        $group: {
          _id: null,
          totalBooks: { $sum: 1 },
          availableBooks: { $sum: { $cond: [{$eq:["$status", "available"]},1,0 ]}},
          unavailableBooks: { $sum: { $cond: [{$eq:["$status", "sold"]},1,0 ]}}
        }
      }
    ])
    return stats[0];
  }
  catch(error) {
    console.log("Error at fetching books stats : ", error)
  }
}

const getTransactionStats = async (id) => {
  const sellerId = new mongoose.Types.ObjectId(id);
  try {
    const stats = await transactionModel.aggregate([
      {
        $match: { sellerId: sellerId }
      },
      {
        $group: {
          _id: null,
          totalTransactions: { $sum: 1 },
          totalRevenue: { $sum: "$price" },
          totalBooksSold: { $sum: { $cond: [{$eq:["$status","delivered"]}, 1, 0 ]} },
          totalBooksPending: { $sum: { $cond: [{$eq:["$status","pending"]}, 1, 0]}},
        }
      }
    ])
    return stats[0];
  } catch (error) {
    console.log("Error at fetching transactions stats : ", error);
  }
}

const getSellerDashboardStats = async (id) => {
  try {
    const booksStats = await getBooksStats(id);
    const transactionStats = await getTransactionStats(id);
    const sellerStats = {
      "Total Books Listed" : booksStats.totalBooks,
      "Total Books Available": booksStats.availableBooks,
      "Total Books Curently Unavailable": booksStats.unavailableBooks,
      "Total Revenue": transactionStats.totalRevenue,
      "Total Books Sold": transactionStats.totalBooksSold,
      "Total Books Pending To Deliver": transactionStats.totalBooksPending
    }

    return sellerStats;
  }
  catch(error){
    console.log("Error at fetching seller dashboard details : ", error);
  }
}

module.exports = {
  getSellerDashboardStats
}
