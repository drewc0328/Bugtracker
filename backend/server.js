const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");

const HttpError = require("./models/http-error");

dotenv.config();

const userRoutes = require("./routes/userRoutes");
const projectRoutes = require("./routes/projectRoutes");
const issueRoutes = require("./routes/issueRoutes");

const server = express();

server.use(bodyParser.json());
server.use(cors());

const MongoConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });
    server.listen(process.env.PORT, () => {
      console.log(`Server connected on port ${process.env.PORT}`);
    });
  } catch (err) {
    console.log("error: " + err);
  }
};

server.use("/api/users", userRoutes);
server.use("/api/projects", projectRoutes);
server.use("/api/issues", issueRoutes);

server.use((req, res, next) => {
  const error = new HttpError("Couldn't find this route", 404);
  throw error;
});

server.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occurred!" });
});

MongoConnection();
