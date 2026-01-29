const mongoose = require("mongoose");

const PolytechSchema = new mongoose.Schema({
  polytech_name: { type: String, required: true, trim: true }
});


module.exports = mongoose.model("Polytech", PolytechSchema);
