const Event = require("../models/event.model");
const User = require("../models/user.model");
const { dateToString } = require("../helpers/dateHelper");

//not populating but using different functions because it allows unlimited level of nesting
//if populate used, then we are limited to Event->Creator->Events
//if we use custom function, then we can go Event->Creator->Events->Creator->Event....... as much as frontend demands
//also, this is not infinite loop because the depth of function calls is determined by frontend

const events = async (eventIds) => {
  try {
    const events = await Event.find({ _id: { $in: eventIds } });
    return events.map((event) => parseEvent(event));
  } catch (error) {
    throw error;
  }
};

const event = async (eventId) => {
  try {
    const event = await Event.findById(eventId);
    return parseEvent(event);
  } catch (e) {
    throw e;
  }
};

const user = async (userId) => {
  try {
    const user = await User.findById(userId);
    return {
      ...user._doc,
      createdEvents: events.bind(this, user._doc.createdEvents),
    };
  } catch (e) {
    throw e;
  }
};

const parseEvent = (event) => {
  return {
    ...event._doc,
    _id: event.id,
    date: dateToString(event._doc.date),
    creator: user.bind(this, event.creator),
  };
};

const parseBooking = (booking) => {
  return {
    ...booking._doc,
    _id: booking.id,
    event: event.bind(this, booking._doc.event),
    user: user.bind(this, booking._doc.user),
    createdAt: dateToString(booking._doc.createdAt),
    updatedAt: dateToString(booking._doc.updatedAt),
  };
};

exports.parseEvent = parseEvent;
exports.parseBooking = parseBooking;
