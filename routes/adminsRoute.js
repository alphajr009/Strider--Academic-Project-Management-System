const express = require("express");
const router = express.Router();
const Admin = require("../models/admin");

router.post("/create", async (req, res) => {
  const {
    name,
    email,
    gender,
    birthday,
    subject,
    level,
    address,
    password,
    isSuperAdmin,
  } = req.body;

  try {
    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      return res
        .status(400)
        .json({ message: "Admin with this email already exists" });
    }

    const newAdmin = new Admin({
      name,
      email,
      gender,
      birthday,
      subject,
      level,
      address,
      password,
      isSuperAdmin,
    });

    await newAdmin.save();

    res.send("User Registered Successfully");
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to create admin", error: error.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email: email });

    if (admin) {
      if (admin.password === password) {
        const temp = {
          name: admin.name,
          email: admin.email,
          isSuperAdmin: admin.isSuperAdmin,
          isInstructor: admin.isInstructor,
          _id: admin._id,
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

router.get("/getInstructors", async (req, res) => {
  try {
    const instructors = await Admin.find();
    res.json(instructors);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to get instructors", error: error.message });
  }
});

router.post("/update", async (req, res) => {
  const { _id, name, email, gender, birthday, subject, level, address } =
    req.body;

  try {
    await Admin.findByIdAndUpdate(_id, {
      name,
      email,
      gender,
      birthday,
      subject,
      level,
      address,
    });
    res.send("Instructor updated successfully");
  } catch (error) {
    console.error("Error updating instructor:", error);
    res.status(500).send("Failed to update instructor");
  }
});

router.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await Admin.findByIdAndDelete(id);
    res.send("Instructor deleted successfully");
  } catch (error) {
    console.error("Error deleting instructor:", error);
    res.status(500).send("Failed to delete instructor");
  }
});

router.post("/getuserbyid", async (req, res) => {
  const { userid } = req.body;

  try {
    const user = await Admin.findById(userid);
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
    await Admin.findByIdAndUpdate(_id, {
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

router.post("/changepassword", async (req, res) => {
  const { id, previousPwd, newPwd } = req.body;

  try {
    const user = await Admin.findById(id);

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

module.exports = router;
