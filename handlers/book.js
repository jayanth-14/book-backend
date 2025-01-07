const userModel = require("../models/user_model");
const bookModel = require("../models/book_model");
const { inputsErrorHandler, internalErrorHandler } = require("./common");
const { getUserLocation } = require("./user");
const { getBooksNear, searchBooks } = require("../database/userQueries");



const addBookHandler = async (req, res) => {
  try {
    const { title, author, publishedYear, description, category, condition, price, quantity, imageUrl } = req.body;
    const sellerId = req.session.userId;
    const user = await userModel.findOne({ _id: sellerId });
    const newBook = {
      title, author, publishedYear, description, category, condition, price, quantity,
      sellerId, location: user.location, imageUrl
    }
    const book = await bookModel.create(newBook);
    res.status(201).json({ status: "success", book });
  } catch (error) {
    internalErrorHandler(res, error);
  }
};

const getBooksHandler = async (req, res) => {
  try {
    const id = req.session.userId;
    const books = await getBooksNear(id);
    res.status(200).json({ status: "success", books });
  } catch (error) {
    internalErrorHandler(res, error);
  }
};

const searchBooksHandler = async (req, res) => {
  try {
    const { q } = req.query;
    const books = await bookModel.aggregate([
      {
        $match: {
          $text: { $search: q }
        }
      },
      {
        $addFields: {
          score: { $meta: "textScore" }
        }
      },
      {
        $unionWith: {
          coll: "books",
          pipeline: [
            {
              $match: {
                $or: [
                  { title: { $regex: q, $options: 'i' } },
                  { description: { $regex: q, $options: 'i' } },
                  { author: { $regex: q, $options: 'i' } }
                ]
              }
            }
          ]
        }
      },
      {
        $group: {
          _id: "$_id",
          title :{ $first: "$title" },
          author : { $first : "$author" },
          publishedYear : { $first : "$publishedYear" },
          description : { $first : "$description" },
          category : { $first : "$category" },
          condition : { $first : "$condition" },
          price : { $first : "$price" },
          quantity : { $first : "$quantity" },
          }
      },
      {
        $sort: {
          score: -1,
          title: 1
        }
      },
      {
        $limit: 20
      }
    ]);

    if (books.length === 0) {
      return res.status(404).json({ status: "error", message: "No books found matching the given criteria." });
    }
    res.status(200).json({ status: "success", books });

  } catch (error) {
    internalErrorHandler(res, error);
  }
};

module.exports = { addBookHandler, getBooksHandler, searchBooksHandler };