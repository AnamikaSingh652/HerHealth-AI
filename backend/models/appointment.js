const mongoose = require("mongoose");

const AppointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  doctorName: {
    type: String,
    required: true
  },

  appointmentDate: {
    type: String,
    required: true
  },

  appointmentTime: {
    type: String,
    required: true
  },

  status: {
    type: String,
    default: "Pending"
  }
});

module.exports = mongoose.model(
  "Appointment",
  AppointmentSchema
);