const mongoose = require("mongoose");

const currentProjectSchema = mongoose.Schema(
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
    github: {
      type: String,
      required: false,
    },
    document: {
      type: String,
      required: false,
    },
    mainProjectId: {
      type: String,
      required: false,
    },
    studentemail: {
      type: String,
      required: false,
    },
    isSetup: {
      type: Boolean,
      default: false,
    },
    commitHistory: {
      type: [
        {
          date: String,
          commitCount: Number,
        },
      ],
      default: [],
    },
    wordCount: {
      type: [
        {
          dateTime: String,
          wordCount: Number,
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const currentProjectModel = mongoose.model(
  "currentProjects",
  currentProjectSchema
);

module.exports = currentProjectModel;
