const express = require("express");
const router = express.Router();
const Project = require("../models/project");
const CurrentProject = require("../models/currentproject");
const axios = require("axios");
const moment = require("moment");
const wordCount = require("word-count");

const GITHUB_PERSONAL_ACCESS_TOKEN = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;

router.post("/createproject", async (req, res) => {
  try {
    const { name, due_date, hours, subject, github, document, students } =
      req.body;

    const newProject = new Project({
      name,
      due_date,
      hours,
      subject,
      github,
      document,
      students,
    });

    const savedProject = await newProject.save();

    res.send("Project Created Successfully");
  } catch (error) {
    console.error("Error creating project:", error);
    res
      .status(500)
      .json({ success: false, message: "Could not create project" });
  }
});

router.get("/getallprojects", async (req, res) => {
  try {
    const projects = await Project.find();

    res.status(200).json({ success: true, projects });
  } catch (error) {
    console.error("Error fetching projects:", error);
    res
      .status(500)
      .json({ success: false, message: "Could not fetch projects" });
  }
});

router.post("/createprojectmodal", async (req, res) => {
  try {
    const {
      name,
      due_date,
      hours,
      subject,
      students,
      instructor_email,
      instructor_name,
    } = req.body;

    const studentEmails = students.map((student) => student.email);

    const newProject = new Project({
      name,
      due_date,
      hours,
      subject,
      students: studentEmails,
      instructor_email,
      instructor_name,
    });

    const savedProject = await newProject.save();

    // Create current project for each student
    for (const studentEmail of studentEmails) {
      const currentProjectData = {
        name: savedProject.name,
        due_date: savedProject.due_date,
        hours: savedProject.hours,
        subject: savedProject.subject,
        instructor_name: savedProject.instructor_name,
        instructor_email: savedProject.instructor_email,
        github: "N/A",
        document: "N/A",
        mainProjectId: savedProject._id,
        studentemail: studentEmail,
      };

      const newCurrentProject = new CurrentProject(currentProjectData);
      await newCurrentProject.save();
    }

    res.send("Project Created Successfully");
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/getCurrentProjectByMain/:projectId", async (req, res) => {
  try {
    const projectId = req.params.projectId;

    const currentProjects = await CurrentProject.find({
      mainProjectId: projectId,
    });

    res.status(200).json({ success: true, currentProjects });
  } catch (error) {
    console.error("Error fetching current projects by main project:", error);
    res
      .status(500)
      .json({ success: false, message: "Could not fetch current projects" });
  }
});

router.get("/getCurrentProjectByProjectId/:projectId", async (req, res) => {
  try {
    const projectId = req.params.projectId;

    const currentProjects = await CurrentProject.findById(projectId);

    res.json(currentProjects);
  } catch (error) {
    console.error("Error fetching current projects by main project:", error);
    res
      .status(500)
      .json({ success: false, message: "Could not fetch current projects" });
  }
});

router.post("/updateprojectdetails", async (req, res) => {
  try {
    const { projectId, github, document } = req.body;

    const currentProject = await CurrentProject.findById(projectId);
    if (!currentProject) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    currentProject.github = github || currentProject.github;
    currentProject.document = document || currentProject.document;

    currentProject.wordCount = [];
    currentProject.commitHistory = [];

    await currentProject.save();

    res
      .status(200)
      .json({ success: true, message: "Project details updated successfully" });
  } catch (error) {
    console.error("Error updating project details:", error);
    res
      .status(500)
      .json({ success: false, message: "Could not update project details" });
  }
});

router.get("/getcurrentprojectsbyid", async (req, res) => {
  try {
    const userEmail = req.query.userEmail;
    const currentProjects = await CurrentProject.find({
      studentemail: userEmail,
    });
    res.status(200).json({ success: true, currentProjects });
  } catch (error) {
    console.error("Error fetching current projects by user ID:", error);
    res
      .status(500)
      .json({ success: false, message: "Could not fetch current projects" });
  }
});

router.post("/setupproject", async (req, res) => {
  try {
    const { projectId, github, document } = req.body;

    const currentProject = await CurrentProject.findById(projectId);
    if (!currentProject) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    currentProject.github = github || currentProject.github;
    currentProject.document = document || currentProject.document;

    currentProject.isSetup = true;

    await currentProject.save();

    res
      .status(200)
      .json({ success: true, message: "Project setup completed successfully" });
  } catch (error) {
    console.error("Error setting up project:", error);
    res
      .status(500)
      .json({ success: false, message: "Could not setup project" });
  }
});

router.get("/getprojectdetails/:projectId", async (req, res) => {
  try {
    const projectId = req.params.projectId;

    const currentProject = await CurrentProject.findById(projectId);
    if (!currentProject) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    res.status(200).json({ success: true, projectDetails: currentProject });
  } catch (error) {
    console.error("Error fetching project details:", error);
    res
      .status(500)
      .json({ success: false, message: "Could not fetch project details" });
  }
});

router.post("/updatecommithistory/:projectId", async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const { repoLink } = req.body;

    if (!repoLink || !repoLink.includes("github.com")) {
      return res
        .status(400)
        .json({ message: "Invalid GitHub repository link" });
    }

    const parts = repoLink.split("/");
    const username = parts[parts.length - 2];
    const repoName = parts[parts.length - 1];

    const repoApiUrl = `https://api.github.com/repos/${username}/${repoName}`;
    const issuesResponse = await axios.get(`${repoApiUrl}/issues?state=closed`);
    const issueDates = issuesResponse.data.map((issue) =>
      moment(issue.closed_at)
    );

    if (issueDates.length === 0) {
      return res
        .status(404)
        .json({ message: "No closed issues found to determine date range" });
    }

    const minDate = moment.min(...issueDates);
    const maxDate = moment.max(...issueDates);

    const commits = [];
    let currentPage = 1;
    let hasNextPage = true;

    while (hasNextPage) {
      const commitsUrl = `${repoApiUrl}/commits?since=${minDate.format(
        "YYYY-MM-DD"
      )}&until=${maxDate
        .add(1, "day")
        .format("YYYY-MM-DD")}&page=${currentPage}`;

      const commitsResponse = await axios.get(commitsUrl, {
        headers: {
          Authorization: `token ${GITHUB_PERSONAL_ACCESS_TOKEN}`,
        },
      });

      if (commitsResponse.data.length === 0) {
        hasNextPage = false;
      } else {
        commits.push(...commitsResponse.data);
        currentPage++;
      }
    }

    const commitCountByDate = commits.reduce((acc, commit) => {
      const commitDate = moment(commit.commit.author.date).format("YYYY-MM-DD");
      acc[commitDate] = (acc[commitDate] || 0) + 1;
      return acc;
    }, {});

    const formattedData = Object.entries(commitCountByDate).map(
      ([date, commitCount]) => ({ date, commitCount })
    );

    const currentProject = await CurrentProject.findById(projectId);
    if (!currentProject) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    currentProject.commitHistory = formattedData;
    await currentProject.save();

    res.status(200).json({
      success: true,
      message: "Commit history updated successfully",
      commitHistory: currentProject.commitHistory,
    });
  } catch (error) {
    console.error("Error updating commit history:", error);
    res
      .status(500)
      .json({ success: false, message: "Could not update commit history" });
  }
});

router.post("/updateissuehistory/:projectId", async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const { repoLink } = req.body;

    if (!repoLink || !repoLink.includes("github.com")) {
      return res
        .status(400)
        .json({ message: "Invalid GitHub repository link" });
    }

    const parts = repoLink.split("/");
    const username = parts[parts.length - 2];
    const repoName = parts[parts.length - 1];

    const repoApiUrl = `https://api.github.com/repos/${username}/${repoName}`;
    const issuesResponse = await axios.get(`${repoApiUrl}/issues?state=closed`);
    const issueDates = issuesResponse.data.map((issue) =>
      moment(issue.closed_at).format("YYYY-MM-DD")
    );

    if (issueDates.length === 0) {
      return res
        .status(404)
        .json({ message: "No closed issues found to determine date range" });
    }

    const issueCountByDate = issueDates.reduce((acc, date) => {
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    const formattedData = Object.entries(issueCountByDate).map(
      ([date, commitCount]) => ({ date, commitCount })
    );

    const currentProject = await CurrentProject.findById(projectId);
    if (!currentProject) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    currentProject.commitHistory = formattedData;
    await currentProject.save();

    res.status(200).json({
      success: true,
      message: "Issue history updated successfully",
      commitHistory: currentProject.commitHistory,
    });
  } catch (error) {
    console.error("Error updating issue history:", error);
    res
      .status(500)
      .json({ success: false, message: "Could not update issue history" });
  }
});

async function fetchDocContent(docUrl) {
  const docId = docUrl.match(/\/document\/d\/([^/]+)\//)[1];
  const url = `https://docs.google.com/document/d/${docId}/export?format=txt`;
  const response = await axios.get(url);
  const content = response.data;

  return content;
}

router.post("/docinfo", async (req, res) => {
  try {
    const { docId } = req.body;
    if (!docId) {
      return res.status(400).json({ message: "Google Doc ID is required" });
    }

    const content = await fetchDocContent(docId);
    const currentDateTime = moment().format("YYYY-MM-DD h:mm a");
    const wordCountResult = wordCount(content);

    res.json({
      dateTime: currentDateTime,
      wordCount: wordCountResult,
    });
  } catch (error) {
    console.error("Error fetching google doc content:", error);
    res.status(500).json({ message: "Error fetching google doc content" });
  }
});

router.post("/docinfo/:projectId", async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const { docId } = req.body;

    if (!docId) {
      return res.status(400).json({ message: "Google Doc ID is required" });
    }

    const content = await fetchDocContent(docId);

    const currentDateTime = moment().format("YYYY-MM-DD h:mm a");

    const wordCountResult = wordCount(content);

    await CurrentProject.findOneAndUpdate(
      { _id: projectId },
      {
        $push: {
          wordCount: {
            dateTime: currentDateTime,
            wordCount: wordCountResult,
          },
        },
      },
      { new: true }
    );

    res.json({
      dateTime: currentDateTime,
      wordCount: wordCountResult,
    });
  } catch (error) {
    console.error("Error fetching google doc content:", error);
    res.status(500).json({ message: "Error fetching google doc content" });
  }
});

router.post("/deletemain", async (req, res) => {
  try {
    const { id } = req.body;

    await CurrentProject.deleteMany({ mainProjectId: id });

    const deletedProject = await Project.findByIdAndDelete(id);

    if (!deletedProject) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    res
      .status(500)
      .json({ success: false, message: "Could not delete project" });
  }
});

module.exports = router;
