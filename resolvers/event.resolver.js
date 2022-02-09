const User = require("../models/user.model");
const Event = require("../models/event.model");
const { parseEvent } = require("./populaters");

module.exports = {
  events: async () => {
    //not populating but using two different functions because it allows unlimited level of nesting
    //if populate used, then we are limited to Event->Creator->Events
    //if we use custom function, then we can go Event->Creator->Events->Creator->Event....... as much as frontend demands
    //also, this is not infinite loop because the depth of function calls is determined by frontend

    try {
      const events = await Event.find();
      return events.map((event) => parseEvent(event));
    } catch (e) {
      console.log(e);
      throw err;
    }
  },

  createEvent: async (args) => {
    try {
      const { title, description, price, date } = args.eventInput;
      const event = new Event({
        title,
        description,
        price: parseFloat(price),
        date: new Date(date),
        creator: "620389db5c04e85623831ad3",
      });
      const result = await event.save();

      const existingUser = await User.findById(result._doc.creator);

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
