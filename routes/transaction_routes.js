const { allowAuthorized, hasFields } = require('../handlers/common');
const {checkout, delivered, getOrders, getTransactions, updateTransaction, updateCancelled, getDeliveries, getTransactionDetails} = require('../handlers/transaction');

const transactionRouter = require('express').Router();

transactionRouter.use(allowAuthorized);

transactionRouter.post('/checkout', checkout);
transactionRouter.post('/transaction', updateTransaction);
transactionRouter.get('/transaction/:id', getTransactionDetails)
transactionRouter.post('/delivered', delivered);
transactionRouter.post('/cancelled', updateCancelled);
transactionRouter.get('/orders', getOrders)
transactionRouter.get('/deliveries', getDeliveries)
transactionRouter.get('/transactions', getTransactions)

module.exports = transactionRouter