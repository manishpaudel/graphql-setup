const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");
const mongoose = require("mongoose");
const Event = require("./models/event.model");
const User = require("./models/user.model");
const bcrypt = require("bcrypt");

const app = express();

app.use(express.json());

const events = (eventIds) => {
  return Event.find({ _id: { $in: eventIds } })
    .then((events) => {
      return events.map((event) => {
        return {
          ...event._doc,
          _id: event.id,
          creator: user.bind(this, event.creator),
        };
      });
    })
    .catch((e) => {
      throw e;
    });
};

const user = (userId) => {
  return User.findById(userId)
    .then((user) => {
      return {
        ...user._doc,
        _id: user.id,
        createdEvents: events.bind(this, user._doc.createdEvents),
      };
    })
    .catch((e) => {
      throw e;
    });
};

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
            creator: User!
        }

        type User {
          _id: ID!
          email: String!
          password: String
          createdEvents:[Event!]
        }

        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        input UserInput {
          email: String!
          password: String!
        }

        type RootQuery{
            events: [Event!]!
        }

        type RootMutation{
            createEvent(eventInput: EventInput): Event
            createUser(userInput: UserInput): User
        }

        schema {
            query: RootQuery,
            mutation: RootMutation
        }
    `),
    rootValue: {
      events: () => {
        //not populating but using two different functions because it allows unlimited level of nesting
        //if populate used, then we are limited to Event->Creator->Events
        //if we use custom function, then we can go Event->Creator->Events->Creator->Event....... as much as frontend demands
        //also, this is not infinite loop because the depth of function calls is determined by frontend

        return Event.find()
          .then((events) => {
            return events.map((event) => {
              return {
                ...event._doc,
                _id: event.id,
                creator: user.bind(this, event._doc.creator),
              };
            });
          })
          .catch((e) => {
            console.log(e);
            throw err;
          });
      },

      createEvent: (args) => {
        const { title, description, price, date } = args.eventInput;
        console.log(description);
        const event = new Event({
          title,
          description,
          price: parseFloat(price),
          date: new Date(date),
          creator: "620365a16f32d0e8673f6b2e",
        });

        let createdEvent;
        return event
          .save()
          .then((result) => {
            createdEvent = {
              ...result._doc,
              creator: user.bind(this, result._doc.creator),
            };
            return User.findById("620365a16f32d0e8673f6b2e");
          })
          .then((user) => {
            if (!user) {
              throw new Error("User doesn't exist");
            }
            user.createdEvents.push(event);
            return user.save();
          })
          .then((result) => {
            return createdEvent;
          })
          .catch((e) => {
            console.log(e);
            throw err;
          });
        events.push(event);
        return event;
      },

      createUser: (args) => {
        const { email, password } = args.userInput;

        return User.findOne({ email })
          .then((user) => {
            if (user) {
              throw new Error("User with that email exists");
            }
            return bcrypt.hash(password, 12);
          })
          .then((hashedPassword) => {
            const user = new User({ email, password: hashedPassword });
            return user.save();
          })
          .then((result) => {
            return { ...result._doc, _id: result._id, password: null };
          })
          .catch((e) => {
            throw e;
          });
      },
    },
    graphiql: true,
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
