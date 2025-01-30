var express = require("express");
var router = express.Router();

const { Op } = require("sequelize");
const db = require("../models");
const { Book } = db;

/* Testing database connection */
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
    /* function for retrieving data with all necessary inputs */
    async function getPaginatedData(model, page, pageSize, where = {}) {
      const offset = (page - 1) * pageSize;

      const { count, rows } = await model.findAndCountAll({
        where,
        offset,
        limit: pageSize,
        attributes: ["id", "title", "author", "genre", "year"],
        raw: true,
      });

      return {
        totalItems: count,
        totalPages: Math.ceil(count / pageSize),
        currentPage: page,
        data: rows,
      };
    }

    /* Defining data function inputs */
    const search =
      req.query.search === null || req.query.search === undefined
        ? ""
        : req.query.search;
    const page =
      req.query.page === null || req.query.page === undefined
        ? 1
        : req.query.page;
    const pageSize = 5;
    const whereCondition = {
      [Op.or]: {
        title: {
          [Op.like]: `%${search}%`,
        },
        author: {
          [Op.like]: `%${search}%`,
        },
        genre: {
          [Op.like]: `%${search}%`,
        },
        year: {
          [Op.eq]: `${search}`,
        },
      },
    };

    const paginatedBooks = await getPaginatedData(
      Book,
      page,
      pageSize,
      whereCondition
    );

    res.render("index", {
      books: paginatedBooks.data,
      title: "Books",
      page: paginatedBooks.currentPage,
      search: search,
      pages: paginatedBooks.totalPages,
    });
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
        res.render("new-book", {
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

/* GET individual book. */
router.get(
  "/:id",
  asyncHandler(async (req, res, next) => {
    const book = await Book.findByPk(req.params.id);
    if (book != null) {
      res.render("update-book", { book, title: "Update Book" });
    } else {
      const err = new Error("Page Not Found");
      err.status = 404;
      next(err);
    }
  })
);

/* Update a book. */
router.post(
  "/:id",
  asyncHandler(async (req, res) => {
    let book;
    try {
      book = await Book.findByPk(req.params.id);
      if (book) {
        await book.update(req.body);
        res.redirect("/books");
      } else {
        res.sendStatus(404);
      }
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        book = await Book.build(req.body);
        book.id = req.params.id;
        res.render("update-book", {
          book,
          errors: error.errors,
          title: "Update Book",
        });
      } else {
        throw error;
      }
    }
  })
);

/* Delete individual book. */
router.post(
  "/:id/delete",
  asyncHandler(async (req, res) => {
    console.log("running");
    const book = await Book.findByPk(req.params.id);
    if (book) {
      await book.destroy();
      res.redirect("/books");
    } else {
      res.sendStatus(404);
    }
  })
);

module.exports = router;
