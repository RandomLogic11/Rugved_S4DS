const submissionsInMemory = require("../data/submissions");
const hackathonsInMemory = require("../data/hackathons");
const SubmissionModel = require("../models/Submission");
const HackathonModel = require("../models/Hackathon");
const { getIsConnected } = require("../config/db");

// Create a project submission
const createSubmission = async (req, res) => {
  try {
    const { hackathonId, teamName, projectName, githubUrl, demoUrl, description } = req.body;

    if (!hackathonId || !teamName || !projectName || !githubUrl || !description) {
      return res.status(400).json({
        message: "hackathonId, teamName, projectName, githubUrl, and description are required."
      });
    }

    const parsedHackathonId = parseInt(hackathonId, 10);

    // MongoDB Flow
    if (getIsConnected()) {
      const hackathonExists = await HackathonModel.findOne({ id: parsedHackathonId });
      if (!hackathonExists) {
        return res.status(404).json({ message: "Associated hackathon does not exist." });
      }

      if (hackathonExists.submissionDeadline) {
        const now = new Date();
        const deadline = new Date(hackathonExists.submissionDeadline);
        if (now > deadline) {
          return res.status(400).json({ message: "Submissions for this hackathon are closed." });
        }
      }

      const totalCount = await SubmissionModel.countDocuments();
      const newSubmission = await SubmissionModel.create({
        id: totalCount + 1,
        hackathonId: parsedHackathonId,
        teamName,
        projectName,
        githubUrl,
        demoUrl: demoUrl || "",
        description
      });

      return res.status(201).json({
        message: "Submission Successful",
        submission: newSubmission
      });
    }

    // Fallback to In-Memory Store
    const hackathonExists = hackathonsInMemory.find((h) => h.id === parsedHackathonId);
    if (!hackathonExists) {
      return res.status(404).json({ message: "Associated hackathon does not exist." });
    }

    if (hackathonExists.submissionDeadline) {
      const now = new Date();
      const deadline = new Date(hackathonExists.submissionDeadline);
      if (now > deadline) {
        return res.status(400).json({ message: "Submissions for this hackathon are closed." });
      }
    }

    const newId = submissionsInMemory.length > 0 ? Math.max(...submissionsInMemory.map((s) => s.id)) + 1 : 1;
    const newSubmission = {
      id: newId,
      hackathonId: parsedHackathonId,
      teamName,
      projectName,
      githubUrl,
      demoUrl: demoUrl || "",
      description,
      submittedAt: new Date().toISOString()
    };
    submissionsInMemory.push(newSubmission);

    res.status(201).json({
      message: "Submission Successful",
      submission: newSubmission
    });
  } catch (error) {
    res.status(500).json({ message: "Server error while processing submission." });
  }
};

// Get all submissions
const getAllSubmissions = async (req, res) => {
  try {
    if (getIsConnected()) {
      const dbSubmissions = await SubmissionModel.find();
      return res.status(200).json(dbSubmissions);
    }
    res.status(200).json(submissionsInMemory);
  } catch (error) {
    res.status(500).json({ message: "Server error while fetching submissions." });
  }
};

// Get submissions by hackathon ID
const getSubmissionsByHackathon = async (req, res) => {
  try {
    const hackathonId = parseInt(req.params.hackathonId, 10);

    if (getIsConnected()) {
      const dbSubmissions = await SubmissionModel.find({ hackathonId });
      return res.status(200).json(dbSubmissions);
    }

    const filtered = submissionsInMemory.filter((s) => s.hackathonId === hackathonId);
    res.status(200).json(filtered);
  } catch (error) {
    res.status(500).json({ message: "Server error while fetching hackathon submissions." });
  }
};

module.exports = {
  createSubmission,
  getAllSubmissions,
  getSubmissionsByHackathon
};
