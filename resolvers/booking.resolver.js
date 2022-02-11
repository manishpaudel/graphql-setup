const Booking = require("../models/booking.model");
const Event = require("../models/event.model");
const { parseBooking, parseEvent } = require("./populaters");

module.exports = {
  bookings: async (args, req) => {
    if (!req.isAuth) {
      throw new Error("Unauthorized");
    }
    try {
      const bookings = await Booking.find();
      return bookings.map((booking) => parseBooking(booking));
    } catch (error) {
      throw error;
    }
  },

  bookEvent: async (args, req) => {
    if (!req.isAuth) {
      throw new Error("Unauthorized");
    }
    try {
      const { eventId } = args;
      const fetchedEvent = await Event.findById(eventId);
      if (!fetchedEvent) throw new Error("The event doesn't exist");
      const booking = new Booking({
        event: eventId,
        user: req.userId,
      });
      const result = await booking.save();
      return parseBooking(result);
    } catch (error) {
      throw error;
    }
  },
  cancelBooking: async (args, req) => {
    if (!req.isAuth) {
      throw new Error("Unauthorized");
    }
    try {
      const { bookingId } = args;
      const booking = await Booking.findById(bookingId).populate("event");
      const event = parseEvent(booking.event);
      await Booking.deleteOne({ _id: bookingId });
      return event;
    } catch (error) {
      throw error;
    }
  },
};
