const { allowAuthorized, hasFields } = require('../handlers/common');
const books = require('../handlers/book');

const bookRouter = require('express').Router();

bookRouter.use(allowAuthorized);

bookRouter.post("/addbook", hasFields(['title', 'author', 'publishedYear', 'description', 'category', 'condition', 'price', 'quantity', 'imageUrl']) ,books.addBookHandler);
bookRouter.get("/books", books.getBooksHandler);
bookRouter.get("/search", books.searchBooksHandler);
bookRouter.get("/book/:id", books.getBookDetails );
bookRouter.get("/wishlist", books.getWishList)
bookRouter.post("/wishlist", hasFields(['bookId']), books.addToWishList)

module.exports = bookRouter;
