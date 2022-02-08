const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");

const app = express();

app.use(express.json());

const events = [];

//only for development, disable in production server

//schema are routes -> query = GET, mutation = POST, PATCH, PUT, DELETE
//type are the return types to be used in rootValue
//rootValue are the controllers
app.use(
  "/graphql",
  graphqlHTTP({
    schema: buildSchema(`

        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        type RootQuery{
            events: [Event!]!
        }

        type RootMutation{
            createEvent(eventInput: EventInput): Event
        }

        schema {
            query: RootQuery,
            mutation: RootMutation
        }
    `),
    rootValue: {
      events: () => {
        return events;
      },

      createEvent: (args) => {
        const { title, description, price, date } = args.eventInput;

        const event = {
          _id: Math.random().toString(),
          title,
          description,
          price: parseFloat(price),
          date,
        };
        events.push(event);
        return event;
      },
    },
    graphiql: true,
  })
);

app.listen(8000, () => {
  console.log("Server started at port 8000");
});
