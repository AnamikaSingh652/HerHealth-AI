const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  phone: String,
  password: String,
  role: {
  type: String,
  enum: ["patient", "doctor", "admin"],
  default: "patient"
}
});

module.exports = mongoose.model("User", UserSchema);