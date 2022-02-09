const User = require("../models/user.model");

const bcrypt = require("bcrypt");

module.exports = {
  createUser: async (args) => {
    const { email, password } = args.userInput;

    try {
      const user = await User.findOne({ email });
      if (user) {
        throw new Error("User with that email exists");
      }
      const hashedPassword = await bcrypt.hash(password, 12);
      const newUser = new User({ email, password: hashedPassword });
      const result = await newUser.save();
      return { ...result._doc, password: null };
    } catch (e) {
      throw e;
    }
  },
};
