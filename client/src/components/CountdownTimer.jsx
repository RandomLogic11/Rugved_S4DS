import React, { useState, useEffect } from "react";

const CountdownTimer = ({ deadline, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    if (!deadline) return;

    const updateTimer = () => {
      const targetDate = new Date(deadline).getTime();
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        if (onExpire) onExpire();
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  if (!deadline) {
    return <span style={{ color: "#64748b" }}>No deadline set</span>;
  }

  if (timeLeft.isExpired) {
    return (
      <div className="alert-error" style={{ display: "inline-block", padding: "6px 14px", borderRadius: "6px", fontWeight: "bold" }}>
        ⛔ Submissions Closed
      </div>
    );
  }

  return (
    <div style={{ display: "inline-flex", gap: "8px", alignItems: "center", backgroundColor: "#f1f5f9", padding: "8px 14px", borderRadius: "8px", fontWeight: "600", color: "#0f172a" }}>
      <span>⏳ Time Remaining:</span>
      <span style={{ color: "#2563eb", fontFamily: "monospace", fontSize: "1.05rem" }}>
        {timeLeft.days > 0 && `${timeLeft.days}d `}
        {String(timeLeft.hours).padStart(2, "0")}h {String(timeLeft.minutes).padStart(2, "0")}m {String(timeLeft.seconds).padStart(2, "0")}s
      </span>
    </div>
  );
};

export default CountdownTimer;
