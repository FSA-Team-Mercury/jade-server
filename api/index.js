const path = require("path");
const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const schema = require("../schema/schema");
const morgan = require("morgan");
const app = express();
const cors = require("cors");
app.use(cors());
// you'll of course want static middleware so your browser can request things like your 'bundle.js'
app.use(express.static(path.join(__dirname, "../../public")));

// body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use("/plaid", require("./plaid"));

app.use(
  "/graphql",
  graphqlHTTP((req, res, graphQLParams) => {
    return {
      schema,
      graphiql: true,
      context: {
        authorization: req.headers.authorization,
      },
    };
  })
);
// Make sure this is right at the end of your server logic!
// The only thing after this might be a piece of middleware to serve up 500 errors for server problems
// (However, if you have middleware to serve up 404s, that go would before this as well)
app.get("/", function (req, res, next) {
  res.send("Hello, Nothing to see here yet!");
});

// error handling middleware
app.use((req, res, next) => {
  const err = new Error("Not found.");
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).send(err.message || "Internal server error");
});

module.exports = app;
