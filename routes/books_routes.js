const { allowAuthorized, hasFields } = require('../handlers/common');
const books = require('../handlers/book');
const multer = require('multer');

const bookRouter = require('express').Router();

bookRouter.use(allowAuthorized);

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 }});

bookRouter.post("/addbook", hasFields(['title', 'author', 'publishedYear', 'description', 'category', 'condition', 'price', 'quantity', 'image']), upload.single('image') ,books.addBookHandler);
bookRouter.get("/books", books.getBooksHandler);
bookRouter.get("/search", books.searchBooksHandler);
bookRouter.get("/book/:id", books.getBookDetails );
bookRouter.get("/wishlist", books.getWishList)
bookRouter.post("/wishlist", hasFields(['bookId']), books.addToWishList)

module.exports = bookRouter;
