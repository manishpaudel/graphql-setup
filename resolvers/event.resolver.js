const User = require("../models/user.model");
const Event = require("../models/event.model");
const { parseEvent } = require("./populaters");

module.exports = {
  events: async () => {
    try {
      const events = await Event.find();
      return events.map((event) => parseEvent(event));
    } catch (e) {
      console.log(e);
      throw err;
    }
  },

  createEvent: async (args, req) => {
    if (!req.isAuth) {
      throw new Error("Unauthorized");
    }
    try {
      const { title, description, price, date } = args.eventInput;
      const event = new Event({
        title,
        description,
        price: parseFloat(price),
        date: new Date(date),
        creator: req.userId,
      });
      const result = await event.save();

      const existingUser = await User.findById(req.userId);

      if (!existingUser) {
        throw new Error("User doesn't exist");
      }
      existingUser.createdEvents.push(event);
      await existingUser.save();

      return parseEvent(result);
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
};
