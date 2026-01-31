import React, { useState } from "react";
import "./style/ResidentPage.css";
import cloudBackground from "./assets/bg-cloud.jpg";

const initialState = {
  First_Name: "",
  Middle_Name: "",
  Last_Name: "",
  Sex: "",
  Height: "",
  Weight: "",
  BMI: "",
  Health_Condition: "",
  Allergies: "",
};

const generateResidentId = () => {
  const part1 = Math.floor(1000000 + Math.random() * 9000000);
  const part2 = Math.floor(1000 + Math.random() * 9000);
  return `RES-${part1}-${part2}`;
};

const weekSchedule = [
  /* dito mag add/remove schedule */
  {
    day: "Monday",
    services: [
      { name: "General check-up", time: "8am to 12pm" },
      { name: "Dental check-up", time: "1pm to 5pm" },
    ],
  },
  {
    day: "Tuesday",
    services: [
      { name: "Immunization", time: "8am to 12pm" },
      { name: "General check-up", time: "1pm to 4pm" },
    ],
  },
  {
    day: "Wednesday",
    services: [
      { name: "Prenatal care", time: "8am to 12pm" },
      { name: "Family planning", time: "1pm to 5pm" },
    ],
  },
  {
    day: "Thursday",
    services: [
      { name: "Laboratory services", time: "8am to 12pm" },
      { name: "General check-up", time: "1pm to 4pm" },
    ],
  },
  {
    day: "Friday",
    services: [
      { name: "General check-up", time: "8am to 12pm" },
      { name: "Dental check-up", time: "1pm to 5pm" },
    ],
  },
  {
    day: "Saturday",
    services: [{ name: "Emergency services only", time: "8am to 12pm" }],
  },
];

export default function ResidentPage({ onCancel, onSubmitSuccess }) {
  const [formData, setFormData] = useState(initialState);
  const [message, setMessage] = useState(null);
  const [residentId, setResidentId] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "Height" || name === "Weight") {
        const h = parseFloat(updated.Height) / 100;
        const w = parseFloat(updated.Weight);
        updated.BMI = h > 0 && w > 0 ? (w / (h * h)).toFixed(2) : "";
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null); // Clear previous messages

    const newCustomId = generateResidentId();

    try {
      // 1. ATTEMPT TO REGISTER RESIDENT

      const residentRes = await fetch("http://localhost:5000/api/residents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Resident_ID: newCustomId,
          First_Name: formData.First_Name,
          Middle_Name: formData.Middle_Name,
          Last_Name: formData.Last_Name,
          Sex: formData.Sex,
          Civil_Status: "",
        }),
      });

      const resData = await residentRes.json();

      // 2. THE ONE NAME POLICY NOTIFICATION
      if (resData.isDuplicate) {
        setResidentId(resData.Resident_ID);
        // This triggers the RED alert box in your UI
        setMessage({
          type: "error",
          text: `⚠️ RECORD ALREADY EXISTS: ${formData.First_Name} ${formData.Last_Name} is already registered with ID: ${resData.Resident_ID}. Duplicate entries are not allowed.`,
        });

        // Use a standard browser alert as a fallback/extra notification
        alert(
          `Duplicate Found!\nResident: ${formData.First_Name} ${formData.Last_Name}\nExisting ID: ${resData.Resident_ID}`,
        );

        return; // STOP HERE. Do not proceed to health submission.
      }

      if (!residentRes.ok) throw new Error("Resident creation failed");

      // 3. PROCEED TO HEALTH SUBMISSION (Only if name is unique)
      const pendingRes = await fetch(
        "http://localhost:5000/api/pending-resident",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            Resident_ID: newCustomId,
            Height: formData.Height || null,
            Weight: formData.Weight || null,
            BMI: formData.BMI || null,
            Health_Condition: formData.Health_Condition || null,
            Allergies: formData.Allergies || null,
            Submitted_At: new Date()
              .toISOString()
              .slice(0, 19)
              .replace("T", " "),
          }),
        },
      );

      if (!pendingRes.ok) throw new Error("Health submission failed");

      // SUCCESS NOTIFICATION
      setResidentId(newCustomId);
      setMessage({
        type: "success",
        text: `Registration Successful! Your Resident ID is: ${newCustomId}`,
      });
      setFormData(initialState); // Clear form only on success

      if (onSubmitSuccess) {
        setTimeout(() => {
          onSubmitSuccess(newCustomId);
        }, 2000);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage({
        type: "error",
        text: "System error. Please try again later.",
      });
    }
  };

  const pageStyle = cloudBackground
    ? {
        "--resident-bg-image": `url(${cloudBackground})`,
      }
    : {};

  return (
    <div className="resident-page-root" style={pageStyle}>
      <div className="resident-form-wrapper">
        {/* LEFT PANEL - FORM */}
        <button className="return-btn" onClick={onCancel}>
          ← Return
        </button>
        <div className="resident-form-left">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h3 className="fw-bold mb-4">
                Resident Registration & Health Submission
              </h3>

              {message && (
                <div
                  className={`alert alert-${message.type === "success" ? "success" : "danger"}`}
                >
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label">First Name</label>
                    <input
                      className="form-control"
                      name="First_Name"
                      value={formData.First_Name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Middle Name</label>
                    <input
                      className="form-control"
                      name="Middle_Name"
                      value={formData.Middle_Name}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Last Name</label>
                    <input
                      className="form-control"
                      name="Last_Name"
                      value={formData.Last_Name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Sex</label>
                    <select
                      className="form-select"
                      name="Sex"
                      value={formData.Sex}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select...</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Height (cm)</label>
                    <input
                      type="number"
                      className="form-control"
                      name="Height"
                      value={formData.Height}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Weight (kg)</label>
                    <input
                      type="number"
                      className="form-control"
                      name="Weight"
                      value={formData.Weight}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">BMI</label>
                    <input
                      className="form-control"
                      value={formData.BMI}
                      readOnly
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Health Condition</label>
                    <select
                      className="form-select"
                      name="Health_Condition"
                      value={formData.Health_Condition}
                      onChange={handleChange}
                    >
                      <option value="">Select...</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                      <option value="Poor">Poor</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Allergies</label>
                    <input
                      className="form-control"
                      name="Allergies"
                      value={formData.Allergies}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-12 d-flex justify-content-end gap-2 mt-3">
                    <button type="submit" className="btn btn-primary">
                      Submit
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - SCHEDULE */}
        <div className="resident-schedule-right">
          <h2 className="schedule-title">Weekly Schedule</h2>

          {weekSchedule.map((daySchedule, idx) => (
            <div key={idx} className="schedule-day">
              <div className="schedule-day-name">{daySchedule.day}:</div>
              {daySchedule.services.map((service, serviceIdx) => (
                <div key={serviceIdx} className="schedule-item">
                  <span className="schedule-service">{service.name}</span>
                  <span className="schedule-time"> - {service.time}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}