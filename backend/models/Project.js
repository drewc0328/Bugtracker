const mongoose = require("mongoose");

const { Schema } = mongoose;

const projectSchema = new Schema({
  name: { type: String, required: true },
  issues: { type: [String], required: false },
  people: [
    {
      _id: false,
      id: { type: String, required: false },
      admin: { type: Boolean, required: false },
    },
  ],
});

module.exports = mongoose.model("Project", projectSchema);
