const hackathonsInMemory = require("../data/hackathons");
const HackathonModel = require("../models/Hackathon");
const { getIsConnected } = require("../config/db");

// Read all hackathons
const getAllHackathons = async (req, res) => {
  try {
    if (getIsConnected()) {
      const dbHackathons = await HackathonModel.find();
      return res.status(200).json(dbHackathons);
    }
    // Fallback to in-memory data
    res.status(200).json(hackathonsInMemory);
  } catch (error) {
    res.status(500).json({ message: "Server error while fetching hackathons." });
  }
};

// Read single hackathon by ID
const getHackathonById = async (req, res) => {
  try {
    const hackathonId = parseInt(req.params.id, 10);

    if (getIsConnected()) {
      const dbHackathon = await HackathonModel.findOne({ id: hackathonId });
      if (!dbHackathon) {
        return res.status(404).json({ message: "Hackathon not found." });
      }
      return res.status(200).json(dbHackathon);
    }

    // Fallback to in-memory data
    const hackathon = hackathonsInMemory.find((h) => h.id === hackathonId);
    if (!hackathon) {
      return res.status(404).json({ message: "Hackathon not found." });
    }

    res.status(200).json(hackathon);
  } catch (error) {
    res.status(500).json({ message: "Server error while fetching hackathon." });
  }
};

// Update an existing hackathon
const updateHackathon = async (req, res) => {
  try {
    const hackathonId = parseInt(req.params.id, 10);
    const { title, description, rules, timeline, date, location, prizePool, submissionDeadline } = req.body;

    if (getIsConnected()) {
      const updatedHackathon = await HackathonModel.findOneAndUpdate(
        { id: hackathonId },
        { $set: { title, description, rules, timeline, date, location, prizePool, submissionDeadline } },
        { new: true }
      );

      if (!updatedHackathon) {
        return res.status(404).json({ message: "Hackathon not found." });
      }
      return res.status(200).json(updatedHackathon);
    }

    // Fallback to in-memory data
    const hackathonIndex = hackathonsInMemory.findIndex((h) => h.id === hackathonId);
    if (hackathonIndex === -1) {
      return res.status(404).json({ message: "Hackathon not found." });
    }

    if (title !== undefined) hackathonsInMemory[hackathonIndex].title = title;
    if (description !== undefined) hackathonsInMemory[hackathonIndex].description = description;
    if (rules !== undefined) hackathonsInMemory[hackathonIndex].rules = rules;
    if (timeline !== undefined) hackathonsInMemory[hackathonIndex].timeline = timeline;
    if (date !== undefined) hackathonsInMemory[hackathonIndex].date = date;
    if (location !== undefined) hackathonsInMemory[hackathonIndex].location = location;
    if (prizePool !== undefined) hackathonsInMemory[hackathonIndex].prizePool = prizePool;
    if (submissionDeadline !== undefined) hackathonsInMemory[hackathonIndex].submissionDeadline = submissionDeadline;

    res.status(200).json(hackathonsInMemory[hackathonIndex]);
  } catch (error) {
    res.status(500).json({ message: "Server error while updating hackathon." });
  }
};

// Delete a hackathon
const deleteHackathon = async (req, res) => {
  try {
    const hackathonId = parseInt(req.params.id, 10);

    if (getIsConnected()) {
      const deletedHackathon = await HackathonModel.findOneAndDelete({ id: hackathonId });
      if (!deletedHackathon) {
        return res.status(404).json({ message: "Hackathon not found." });
      }
      return res.status(200).json({ message: "Hackathon deleted successfully.", hackathon: deletedHackathon });
    }

    // Fallback to in-memory data
    const hackathonIndex = hackathonsInMemory.findIndex((h) => h.id === hackathonId);
    if (hackathonIndex === -1) {
      return res.status(404).json({ message: "Hackathon not found." });
    }

    const deleted = hackathonsInMemory.splice(hackathonIndex, 1);
    res.status(200).json({ message: "Hackathon deleted successfully.", hackathon: deleted[0] });
  } catch (error) {
    res.status(500).json({ message: "Server error while deleting hackathon." });
  }
};

// Create a new hackathon
const createHackathon = async (req, res) => {
  try {
    const { title, description, date, location, prizePool, rules, timeline, submissionDeadline } = req.body;

    if (!title || !description || !date) {
      return res.status(400).json({ message: "Title, description, and date are required." });
    }

    if (getIsConnected()) {
      const totalCount = await HackathonModel.countDocuments();
      const newHackathon = await HackathonModel.create({
        id: totalCount + 1,
        title,
        description,
        date,
        location: location || "Online",
        prizePool: prizePool || "N/A",
        rules: rules || "",
        timeline: timeline || "",
        submissionDeadline: submissionDeadline || ""
      });
      return res.status(201).json(newHackathon);
    }

    // Fallback to in-memory store
    const newId = hackathonsInMemory.length > 0 ? Math.max(...hackathonsInMemory.map((h) => h.id)) + 1 : 1;

    const newHackathon = {
      id: newId,
      title,
      description,
      date,
      location: location || "Online",
      prizePool: prizePool || "N/A",
      rules: rules || "",
      timeline: timeline || "",
      submissionDeadline: submissionDeadline || ""
    };

    hackathonsInMemory.push(newHackathon);

    res.status(201).json(newHackathon);
  } catch (error) {
    res.status(500).json({ message: "Server error while creating hackathon." });
  }
};



module.exports = {
  getAllHackathons,
  getHackathonById,
  createHackathon,
  updateHackathon,
  deleteHackathon
};
