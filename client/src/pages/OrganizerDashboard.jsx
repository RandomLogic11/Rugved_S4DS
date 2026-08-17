import React, { useEffect, useState } from "react";
import { getHackathons, createHackathon, updateHackathon, deleteHackathon } from "../services/api";

const OrganizerDashboard = () => {
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHackathon, setEditingHackathon] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    rules: "",
    timeline: "",
    location: "",
    prizePool: "",
    submissionDeadline: ""
  });

  // Create Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    prizePool: "",
    submissionDeadline: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getHackathons();
      setHackathons(data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch hackathons.");
      setLoading(false);
    }
  };

  // Handlers for Edit Modal
  const handleOpenEditModal = (hackathon) => {
    setEditingHackathon(hackathon);
    setFormData({
      title: hackathon.title || "",
      description: hackathon.description || "",
      date: hackathon.date || "",
      rules: hackathon.rules || "",
      timeline: hackathon.timeline || "",
      location: hackathon.location || "",
      prizePool: hackathon.prizePool || "",
      submissionDeadline: hackathon.submissionDeadline || ""
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingHackathon(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingHackathon) return;

    try {
      await updateHackathon(editingHackathon.id, formData);
      handleCloseModal();
      fetchData();
    } catch (err) {
      alert("Error updating hackathon: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this hackathon?")) {
      try {
        await deleteHackathon(id);
        fetchData();
      } catch (err) {
        alert("Failed to delete hackathon.");
      }
    }
  };

  // Handlers for Create Modal
  const handleOpenCreateModal = () => {
    setCreateFormData({
      title: "",
      description: "",
      date: "",
      location: "",
      prizePool: "",
      submissionDeadline: ""
    });
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleCreateInputChange = (e) => {
    const { name, value } = e.target;
    setCreateFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await createHackathon(createFormData);
      handleCloseCreateModal();
      fetchData();
    } catch (err) {
      alert("Error creating hackathon: " + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h2>Organizer Dashboard</h2>
          <p className="text-muted">Manage existing hackathons (Edit details or Delete).</p>
        </div>
        <button onClick={handleOpenCreateModal} className="btn btn-primary">
          + Create Hackathon
        </button>
      </div>

      {error && <div className="alert-error">{error}</div>}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Date</th>
              <th>Submission Deadline</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {hackathons.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", color: "#64748b" }}>
                  No hackathons found.
                </td>
              </tr>
            ) : (
              hackathons.map((h) => (
                <tr key={h.id}>
                  <td>#{h.id}</td>
                  <td>
                    <strong>{h.title}</strong>
                  </td>
                  <td>{h.date}</td>
                  <td>
                    {h.submissionDeadline ? (
                      new Date(h.submissionDeadline) < new Date() ? (
                        <span style={{ color: "#ef4444", fontWeight: "bold" }}>⛔ Closed</span>
                      ) : (
                        <span style={{ color: "#16a34a", fontWeight: "600" }}>
                          {new Date(h.submissionDeadline).toLocaleString()}
                        </span>
                      )
                    ) : (
                      <span style={{ color: "#64748b" }}>No deadline</span>
                    )}
                  </td>
                  <td>
                    <div className="btn-group">
                      <button onClick={() => handleOpenEditModal(h)} className="btn btn-secondary">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(h.id)} className="btn btn-danger">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {isModalOpen && editingHackathon && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Edit Hackathon #{editingHackathon.id}</h3>
            <form onSubmit={handleSubmit} style={{ marginTop: "15px" }}>
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Date *</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Submission Deadline</label>
                <input
                  type="datetime-local"
                  name="submissionDeadline"
                  value={formData.submissionDeadline}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g. Online or Tech Hub"
                />
              </div>

              <div className="form-group">
                <label>Prize Pool</label>
                <input
                  type="text"
                  name="prizePool"
                  value={formData.prizePool}
                  onChange={handleInputChange}
                  placeholder="e.g. ₹50,000"
                />
              </div>

              <div className="btn-group" style={{ justifyContent: "flex-end", marginTop: "20px" }}>
                <button type="button" onClick={handleCloseModal} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Hackathon Modal */}
      {isCreateModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Create New Hackathon</h3>
            <form onSubmit={handleCreateSubmit} style={{ marginTop: "15px" }}>
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  name="title"
                  value={createFormData.title}
                  onChange={handleCreateInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  name="description"
                  value={createFormData.description}
                  onChange={handleCreateInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Date *</label>
                <input
                  type="date"
                  name="date"
                  value={createFormData.date}
                  onChange={handleCreateInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Submission Deadline</label>
                <input
                  type="datetime-local"
                  name="submissionDeadline"
                  value={createFormData.submissionDeadline}
                  onChange={handleCreateInputChange}
                />
              </div>

              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  value={createFormData.location}
                  onChange={handleCreateInputChange}
                  placeholder="e.g. Online or Tech Hub"
                />
              </div>

              <div className="form-group">
                <label>Prize Pool</label>
                <input
                  type="text"
                  name="prizePool"
                  value={createFormData.prizePool}
                  onChange={handleCreateInputChange}
                  placeholder="e.g. ₹50,000"
                />
              </div>

              <div className="btn-group" style={{ justifyContent: "flex-end", marginTop: "20px" }}>
                <button type="button" onClick={handleCloseCreateModal} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Hackathon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizerDashboard;
