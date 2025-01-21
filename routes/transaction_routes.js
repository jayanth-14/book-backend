const { allowAuthorized, hasFields } = require('../handlers/common');
const {checkout, delivered, getOrders} = require('../handlers/transaction');

const transactionRouter = require('express').Router();

transactionRouter.use(allowAuthorized);

transactionRouter.post('/checkout', checkout);
transactionRouter.post('/delivered', delivered);
transactionRouter.get('/orders', getOrders)

module.exports = transactionRouter