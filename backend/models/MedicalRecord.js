const mongoose = require("mongoose");

const MedicalRecordSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  age: {
    type: Number,
    required: true
  },

  weight: {
    type: Number,
    required: true
  },

  height: {
    type: Number,
    required: true
  },

  bloodGroup: {
    type: String,
    required: true
  },

  allergies: {
    type: String,
    default: "None"
  },

  diseases: {
    type: String,
    default: "None"
  },

  medications: {
    type: String,
    default: "None"
  },

  emergencyContact: {
    type: String
  }

}, {
  timestamps: true
});

module.exports = mongoose.model(
  "MedicalRecord",
  MedicalRecordSchema
);