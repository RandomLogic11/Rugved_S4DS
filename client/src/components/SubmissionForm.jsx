import React, { useState, useEffect } from "react";
import { submitProject } from "../services/api";

const SubmissionForm = ({ hackathonId, submissionDeadline, onSubmitSuccess }) => {
  const [formData, setFormData] = useState({
    teamName: "",
    projectName: "",
    githubUrl: "",
    demoUrl: "",
    description: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  useEffect(() => {
    if (submissionDeadline) {
      const diff = new Date(submissionDeadline) - new Date();
      if (diff <= 0) {
        setIsClosed(true);
      }
    }
  }, [submissionDeadline]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (isClosed) {
      setError("Submissions for this hackathon are closed.");
      return;
    }

    if (!formData.teamName || !formData.projectName || !formData.githubUrl || !formData.description) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);
      await submitProject({
        hackathonId,
        ...formData
      });
      setLoading(false);
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || "Failed to submit project. Please try again.");
    }
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      {isClosed && (
        <div className="alert-error" style={{ marginBottom: "20px", fontWeight: "bold" }}>
          ⛔ Submissions for this hackathon are closed because the deadline has passed.
        </div>
      )}

      {error && !isClosed && <div className="alert-error">{error}</div>}

      <div className="form-group">
        <label htmlFor="teamName">Team Name *</label>
        <input
          type="text"
          id="teamName"
          name="teamName"
          value={formData.teamName}
          onChange={handleChange}
          placeholder="e.g. Code Ninjas"
          disabled={isClosed}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="projectName">Project Name *</label>
        <input
          type="text"
          id="projectName"
          name="projectName"
          value={formData.projectName}
          onChange={handleChange}
          placeholder="e.g. Smart Energy Dashboard"
          disabled={isClosed}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="githubUrl">GitHub Repository Link *</label>
        <input
          type="url"
          id="githubUrl"
          name="githubUrl"
          value={formData.githubUrl}
          onChange={handleChange}
          placeholder="https://github.com/username/project"
          disabled={isClosed}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="demoUrl">Demo Video Link</label>
        <input
          type="url"
          id="demoUrl"
          name="demoUrl"
          value={formData.demoUrl}
          onChange={handleChange}
          placeholder="https://youtube.com/watch?v=..."
          disabled={isClosed}
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Project Description *</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Briefly describe what your project does and technologies used..."
          disabled={isClosed}
          required
        />
      </div>

      <button
        type="submit"
        className="btn btn-primary"
        disabled={loading || isClosed}
        style={{ width: "100%", opacity: isClosed ? 0.6 : 1, cursor: isClosed ? "not-allowed" : "pointer" }}
      >
        {isClosed ? "Submissions Closed" : loading ? "Submitting..." : "Submit Project"}
      </button>
    </form>
  );
};

export default SubmissionForm;
