const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const Appointment = require("./models/Appointment");
const Doctor = require("./models/Doctor");
const MedicalRecord = require("./models/MedicalRecord");
const auth = require("./middleware/auth");

require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Home Route
app.get("/", (req, res) => {
  res.send("ANAMIKA BACKEND 123");
});

// MongoDB Connection
// MongoDB Connection

console.log("MONGO_URI =", process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 10000,
})
.then(() => {
  console.log("✅ MongoDB Connected");
})
.catch((err) => {
  console.log("FULL ERROR:");
  console.log(JSON.stringify(err, null, 2));
});

// ==================== REGISTER API ====================

app.post("/register", async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email }, { phone }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullName,
      email,
      phone,
      password: hashedPassword
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "Registration Successful"
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ==================== LOGIN API ====================

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found"
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid password"
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    res.status(200).json({
      success: true,
      message: "Login Successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });

  } catch (error) {
    console.log("LOGIN ERROR:");
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ==================== TEST ROUTES ====================

app.get("/test", (req, res) => {
  res.json({
    message: "Register route loaded"
  });
});

app.get("/routes", (req, res) => {
  res.send("Routes Working");
});
// PROFILE API

app.get("/profile", auth, async (req, res) => {
  try {

    const user = await User.findById(
      req.user.id
    ).select("-password");

    res.status(200).json({
      success: true,
      user
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
});

// ==================== START SERVER ====================
app.post("/book-appointment", auth, async (req, res) => {
  try {

    const {
      doctorName,
      appointmentDate,
      appointmentTime
    } = req.body;

    const appointment = new Appointment({
      patientId: req.user.id,
      doctorName,
      appointmentDate,
      appointmentTime
    });

    await appointment.save();

    res.status(201).json({
      success: true,
      message: "Appointment Booked",
      appointment
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
app.get("/my-appointments", auth, async (req, res) => {
  try {

    const appointments = await Appointment.find({
      patientId: req.user.id
    });

    res.status(200).json({
      success: true,
      appointments
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
});
app.delete("/cancel-appointment/:id", auth, async (req, res) => {
  try {

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found"
      });
    }

    if (appointment.patientId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized"
      });
    }

    await Appointment.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Appointment Cancelled"
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
});
// ==================== UPDATE APPOINTMENT STATUS ====================

app.patch("/update-appointment-status/:id", auth, async (req, res) => {
  try {

    const { status } = req.body;

    const appointment = await Appointment.findById(
      req.params.id
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found"
      });
    }

    appointment.status = status;

    await appointment.save();

    res.status(200).json({
      success: true,
      message: "Status Updated",
      appointment
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
});
// ADD DOCTOR API

app.post("/add-doctor", async (req, res) => {
  try {

    const {
      doctorName,
      specialization,
      experience,
      fees
    } = req.body;

    const doctor = new Doctor({
      doctorName,
      specialization,
      experience,
      fees
    });

    await doctor.save();

    res.status(201).json({
      success: true,
      message: "Doctor Added Successfully",
      doctor
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
});
// GET ALL DOCTORS

app.get("/doctors", async (req, res) => {
  try {

    const doctors = await Doctor.find();

    res.status(200).json({
      success: true,
      doctors
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
});
// ==================== SAVE MEDICAL RECORD ====================

// ==================== SAVE MEDICAL RECORD ====================

app.post("/medical-record", auth, async (req, res) => {
  try {

    const {
      age,
      weight,
      height,
      bloodGroup,
      allergies,
      diseases,
      medications,
      emergencyContact
    } = req.body;

    const record = new MedicalRecord({
      patientId: req.user.id,
      age,
      weight,
      height,
      bloodGroup,
      allergies,
      diseases,
      medications,
      emergencyContact
    });

    await record.save();

    res.status(201).json({
      success: true,
      message: "Medical Record Saved",
      record
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
});
// ==================== GET MEDICAL RECORD ====================

app.get("/medical-record", auth, async (req, res) => {
  try {

    const record = await MedicalRecord.findOne({
      patientId: req.user.id
    });

    res.status(200).json({
      success: true,
      record
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
});
app.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});