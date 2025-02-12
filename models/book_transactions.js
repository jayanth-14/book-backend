const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const transactionSchema = new Schema({
  transactionDate: {
    type: Date,
    required: true
  },
  bookId :{
    type: Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  title: {
    type: String
  },
  transactionAmount: {
    type: Number,
    required: true
  },
  quantity : {
    type: Number,
    required: true
  },
  userId : {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  paymentId: {
    type: Schema.Types.ObjectId,
  },
  sellerId : {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  transactionStatus: {
    type: String,
    enum: ['pending' ,'paid', 'delivered', 'cancelled', 'failed'],
    default: 'pending'
  },
  message : {
    type: String
  }
})

const transactionModel = mongoose.model("transactions",transactionSchema);

module.exports = transactionModel;