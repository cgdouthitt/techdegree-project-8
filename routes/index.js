var express = require("express");
var router = express.Router();

const db = require("../models/index");
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

/* GET home page. */
router.get("/", function (req, res, next) {
  res.redirect("/books");
});

/* GET books page. */
router.get("/books", function (req, res, next) {
  (async () => {
    const books = await Book.findAll({
      attributes: ["id", "title", "author", "genre", "year"],
      raw: true,
    });
    res.render("index", { books: books, title: "Books" });
  })();
});

module.exports = router;
