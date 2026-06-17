const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
  doctorName: {
    type: String,
    required: true
  },

  specialization: {
    type: String,
    required: true
  },

  experience: {
    type: Number,
    required: true
  },

  fees: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model(
  "Doctor",
  doctorSchema
);