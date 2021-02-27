const mongoose = require("mongoose");

const { Schema } = mongoose;

const issueSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: false },
  created_by: { type: String, required: true },
  created_at: { type: Date, required: true },
  assigned_to: { type: [String], required: false },
  status: { type: String, required: true },
  priority: { type: String, required: true },
});

module.exports = mongoose.model("Issue", issueSchema);
