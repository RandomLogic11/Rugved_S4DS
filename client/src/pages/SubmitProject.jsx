import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getHackathonById } from "../services/api";
import SubmissionForm from "../components/SubmissionForm";
import CountdownTimer from "../components/CountdownTimer";

const SubmitProject = () => {
  const { id } = useParams();
  const [hackathon, setHackathon] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHackathon();
  }, [id]);

  const fetchHackathon = async () => {
    try {
      setLoading(true);
      const data = await getHackathonById(id);
      setHackathon(data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ textAlign: "center", marginBottom: "8px" }}>
          Submit Project for {hackathon ? hackathon.title : `Hackathon #${id}`}
        </h2>
        {hackathon?.submissionDeadline && (
          <div style={{ marginBottom: "12px" }}>
            <CountdownTimer deadline={hackathon.submissionDeadline} />
          </div>
        )}
        <p className="text-muted" style={{ textAlign: "center" }}>
          Enter your team details and repository link below.
        </p>
      </div>

      {submitted ? (
        <div style={{ textAlign: "center", marginTop: "30px" }}>
          <div className="alert-success" style={{ fontSize: "1.2rem", fontWeight: "bold", padding: "20px" }}>
            Submission Successful
          </div>
          <div style={{ marginTop: "20px" }}>
            <Link to="/" className="btn btn-primary" style={{ marginRight: "10px" }}>
              Back to Hackathons
            </Link>
            <Link to={`/hackathon/${id}`} className="btn btn-secondary">
              View Hackathon Details
            </Link>
          </div>
        </div>
      ) : (
        <SubmissionForm
          hackathonId={id}
          submissionDeadline={hackathon?.submissionDeadline}
          onSubmitSuccess={() => setSubmitted(true)}
        />
      )}
    </div>
  );
};

export default SubmitProject;
