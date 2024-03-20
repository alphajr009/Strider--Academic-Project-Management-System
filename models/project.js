const mongoose = require("mongoose");

const projectSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: false,
    },
    due_date: {
      type: String,
      required: false,
    },
    hours: {
      type: String,
      required: false,
    },
    subject: {
      type: String,
      required: false,
    },
    instructor_name: {
      type: String,
      required: false,
    },
    instructor_email: {
      type: String,
      required: false,
    },

    students: [],
  },
  {
    timestamps: true,
  }
);

const projectModel = mongoose.model("projects", projectSchema);

module.exports = projectModel;
