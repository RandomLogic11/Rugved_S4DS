import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getHackathonById } from "../services/api";
import CountdownTimer from "../components/CountdownTimer";

const HackathonDetails = () => {
  const { id } = useParams();
  const [hackathon, setHackathon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isClosed, setIsClosed] = useState(false);

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const data = await getHackathonById(id);
      setHackathon(data);

      if (data?.submissionDeadline) {
        const diff = new Date(data.submissionDeadline) - new Date();
        if (diff <= 0) {
          setIsClosed(true);
        }
      }

      setLoading(false);
    } catch (err) {
      setError("Failed to fetch hackathon details.");
      setLoading(false);
    }
  };

  if (loading) return <div>Loading hackathon details...</div>;
  if (error) return <div className="alert-error">{error}</div>;
  if (!hackathon) return <div>Hackathon not found.</div>;

  return (
    <div className="detail-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px", marginBottom: "15px" }}>
        <div>
          <h1 style={{ marginBottom: "10px" }}>{hackathon.title}</h1>
          <p className="text-muted">
            📅 Date: {hackathon.date} | 📍 Venue: {hackathon.location} | 🏆 Prize Pool: {hackathon.prizePool}
          </p>
        </div>
        <CountdownTimer deadline={hackathon.submissionDeadline} onExpire={() => setIsClosed(true)} />
      </div>

      <div className="detail-section">
        <h3>Description</h3>
        <p>{hackathon.description}</p>
      </div>

      <div className="detail-section">
        <h3>Rules</h3>
        <p style={{ whiteSpace: "pre-line" }}>{hackathon.rules}</p>
      </div>

      <div className="detail-section">
        <h3>Timeline</h3>
        <p>{hackathon.timeline}</p>
      </div>

      <div className="detail-section">
        <h3>Prize</h3>
        <p>{hackathon.prizePool}</p>
      </div>

      <div className="detail-section">
        <h3>Venue</h3>
        <p>{hackathon.location}</p>
      </div>

      <div style={{ marginTop: "30px", borderTop: "1px solid #e2e8f0", paddingTop: "20px" }}>
        {isClosed ? (
          <button className="btn btn-secondary" disabled style={{ fontSize: "1rem", padding: "10px 20px", cursor: "not-allowed", opacity: 0.6 }}>
            ⛔ Submissions Closed
          </button>
        ) : (
          <Link to={`/submit/${hackathon.id}`} className="btn btn-primary" style={{ fontSize: "1rem", padding: "10px 20px" }}>
            Submit Project
          </Link>
        )}
      </div>
    </div>
  );
};

export default HackathonDetails;
