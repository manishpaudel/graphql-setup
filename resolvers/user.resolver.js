const User = require("../models/user.model");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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

  login: async ({ email, password }) => {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error("User doesn't exist");
      }
      const isEqual = await bcrypt.compare(password, user.password);
      if (!isEqual) {
        throw new Error("Password is incorrect");
      }
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        "SomeSuperSecretKey",
        { expiresIn: "1h" }
      );
      return { userId: user.id, token: token, tokenExpiration: 1 };
    } catch (error) {
      throw error;
    }
  },
};
