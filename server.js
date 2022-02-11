const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const mongoose = require("mongoose");

const schemas = require("./schemas/index");
const resolvers = require("./resolvers/index");
const isAuth = require("./middlewares/isAuth");

const app = express();

app.use(express.json());

//CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  //browsers tend to send OPTIONS method before POST for general lookup
  //graphql cant handle OPTIONS, so handling it manually
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

//using middleware not similar to REST
//isAuth sets metadata in request, checking metadata in controllers for access
//for single use middleares, implement functions in controllers/resolvers
app.use(isAuth);

//schema are routes -> query = GET, mutation = POST, PATCH, PUT, DELETE
//type are the return types to be used in rootValue
//rootValue are the controllers
app.use(
  "/graphql",
  graphqlHTTP({
    schema: schemas,
    rootValue: resolvers,
    graphiql: true, //only for development, disable in production server
  })
);

app.listen(8000, () => {
  console.log("Server started at port 8000");
  mongoose
    .connect("mongodb://127.0.0.1:27017/graphqlDemo", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("mongodb connected");
    })
    .catch((e) => {
      console.log("error on connecting database>>", e);
    });
});
