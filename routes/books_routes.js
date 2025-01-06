const { allowAuthorized, hasFields } = require('../handlers/common');
const books = require('../handlers/book');

const bookRouter = require('express').Router();

bookRouter.use(allowAuthorized);


bookRouter.post("/books", hasFields(['title', 'author', 'publishedYear', 'description', 'category', 'condition', 'price', 'quantity', 'imageUrl']) ,books.addBookHandler);
bookRouter.get("/books", books.getBooksHandler);
bookRouter.post("/search", books.searchBooksHandler);

module.exports = bookRouter;
