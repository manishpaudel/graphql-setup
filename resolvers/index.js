const userResolver = require("./user.resolver");
const eventResolver = require("./event.resolver");
const bookingResolver = require("./booking.resolver");

module.exports = {
  ...userResolver,
  ...eventResolver,
  ...bookingResolver,
};
