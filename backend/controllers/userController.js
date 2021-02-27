const HttpError = require("../models/http-error");

const User = require("../models/User");

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError("Error finding the user", 422);
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError("Couldn't find a user with this email", 422);
    return next(error);
  }

  if (existingUser.password !== password) {
    const error = new HttpError("Invalid Password", 422);
    return next(error);
  }

  res.status(201).json({ user: existingUser });
};

const signup = async (req, res, next) => {
  const { name, email, password } = req.body;

  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError("Error finding the user", 422);
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError("A user with this email already exists", 422);
    return next(error);
  }

  existingUser = new User({
    name,
    email,
    password,
    projects: [],
  });

  console.log("existingUser: ", existingUser);

  try {
    await existingUser.save();
  } catch (err) {
    const error = new HttpError(
      "Signing up user failed, please try again",
      500
    );
    return next(error);
  }

  res.status(201).json({ user: existingUser });
};

const getUserById = async (req, res, next) => {
  const { id } = req.body;

  let existingUser;

  try {
    existingUser = await User.findById(id);
  } catch (err) {
    const error = new HttpError("Error finding the user", 422);
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError("A user with that ID doesn't exist", 422);
    return next(error);
  }

  res.status(201).send({ user: existingUser });
};

const getUsers = async (req, res, next) => {
  let users;

  try {
    users = await User.find({});
  } catch (err) {
    const error = new HttpError("Error finding the user", 422);
    return next(error);
  }

  res.status(201).send({ user: users });
};

exports.login = login;
exports.signup = signup;
exports.getUserById = getUserById;
exports.getUsers = getUsers;
