var express = require("express");
var router = express.Router();

const db = require("../models");
const { Book } = db;

(async () => {
  await db.sequelize.sync();

  try {
    await db.sequelize.authenticate();
    console.log("Connection to the database successful!");
  } catch (error) {
    console.error("Error connecting to the database: ", error);
  }
})();

/* Handler function to wrap each route. */
function asyncHandler(cb) {
  return async (req, res, next) => {
    try {
      await cb(req, res, next);
    } catch (error) {
      // Forward error to the global error handler
      next(error);
    }
  };
}

/* GET books page. */
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const books = await Book.findAll({
      attributes: ["id", "title", "author", "genre", "year"],
      raw: true,
    });
    res.render("index", { books: books, title: "Books" });
  })
);

/* GET new book page. */
router.get("/new", function (req, res, next) {
  res.render("new-book", { title: "New Book" });
});

/* POST create new book page. */
router.post(
  "/",
  asyncHandler(async (req, res) => {
    let book;
    try {
      book = await Book.create(req.body);
      res.redirect("/books");
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        book = await Book.build(req.body);
        res.render("books/new", {
          book,
          errors: error.errors,
          title: "New Book",
        });
      } else {
        throw error;
      }
    }
  })
);

module.exports = router;
