const mongoose = require("mongoose");

const CollegeSchema = new mongoose.Schema({
  college_name: { type: String, required: true, trim: true }
});


module.exports = mongoose.model("College", CollegeSchema);
