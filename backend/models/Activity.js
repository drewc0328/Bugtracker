const mongoose = require("mongoose");

const { Schema } = mongoose;

const activitySchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: false },
  date: { type: Date, required: true },
});

module.exports = mongoose.model("Project", activitySchema);
