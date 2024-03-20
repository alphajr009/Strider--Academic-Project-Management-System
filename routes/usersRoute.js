const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Otp = require("../models/otp");
const CurrentProject = require("../models/currentproject");

router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User with this email already exists." });
    }

    const newUser = new User({ email, password });
    const user = await newUser.save();
    res.send("User Registered Successfully");
  } catch (error) {
    return res.status(400).json({ error });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email });

    if (user) {
      if (user.password === password) {
        const temp = {
          name: user.name,
          email: user.email,
          _id: user._id,
        };
        res.send(temp);
      } else {
        return res.status(400).json({ message: "Password incorrect" });
      }
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    return res.status(400).json({ error });
  }
});

router.post("/getuserbyid", async (req, res) => {
  const { userid } = req.body;

  try {
    const user = await User.findById(userid);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error getting user by ID:", error);
    res.status(500).send("Failed to get user by ID");
  }
});

router.patch("/updateuser", async (req, res) => {
  const { _id, name, email, gender, birthday, subject, level, address } =
    req.body;

  try {
    await User.findByIdAndUpdate(_id, {
      name,
      email,
      gender,
      birthday,
      subject,
      level,
      address,
    });

    res.send("User details updated successfully");
  } catch (error) {
    console.error("Error updating user details:", error);
    res.status(500).send("Failed to update user details");
  }
});

router.post("/changepasswordOtp", async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.password = newPassword;
    await user.save();

    await Otp.deleteOne({ email });

    res.send("Password changed successfully");
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).send("Failed to change password");
  }
});

router.post("/changepassword", async (req, res) => {
  const { id, previousPwd, newPwd } = req.body;

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.password !== previousPwd) {
      return res.status(400).json({ message: "Previous password incorrect" });
    }

    user.password = newPwd;
    await user.save();

    res.send("Password changed successfully");
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).send("Failed to change password");
  }
});

router.get("/getStudents", async (req, res) => {
  try {
    const students = await User.find();
    res.json(students);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to get Students", error: error.message });
  }
});

router.post("/getCurrentProjectByEmail", async (req, res) => {
  const { studentEmail } = req.body;

  try {
    const projects = await CurrentProject.find({ studentemail: studentEmail });

    if (!projects || projects.length === 0) {
      return res
        .status(404)
        .json({ message: "No projects found for the given email" });
    }
    const projectNames = projects.map((project) => project.name);

    res.json(projectNames);
  } catch (error) {
    console.error("Error fetching current projects by email:", error);
    res.status(500).send("Failed to fetch current projects by email");
  }
});

module.exports = router;
