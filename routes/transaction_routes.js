const { allowAuthorized, hasFields } = require('../handlers/common');
const {checkout, delivered, getOrders, getTransactions} = require('../handlers/transaction');

const transactionRouter = require('express').Router();

transactionRouter.use(allowAuthorized);

transactionRouter.post('/checkout', checkout);
transactionRouter.post('/delivered', delivered);
transactionRouter.get('/orders', getOrders)
transactionRouter.get('/transactions', getTransactions)

module.exports = transactionRouter