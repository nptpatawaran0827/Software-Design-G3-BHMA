import { useNavigate } from "react-router-dom";
import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import "./style/HeaderBanner.css";

const HeaderBanner = ({ onAcceptResident, onLogout }) => {
  const [pendingResidents, setPendingResidents] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const notificationRef = useRef(null);
  const bellButtonRef = useRef(null);

  // Fetch pending residents
  const fetchPending = async () => {
    try {
      const res = await fetch("https://software-design-g3-bhma-2026.onrender.com/api/pending-residents");
      const data = await res.json();
      setPendingResidents(data);
    } catch (err) {
      console.error("Error fetching pending residents:", err);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  // Calculate dropdown position
  const updateDropdownPosition = () => {
    if (bellButtonRef.current) {
      const rect = bellButtonRef.current.getBoundingClientRect();
      const screenWidth = window.innerWidth;

      // Responsive dropdown width
      let dropdownWidth = 380;
      if (screenWidth <= 576) {
        dropdownWidth = Math.min(320, screenWidth - 32);
      } else if (screenWidth <= 768) {
        dropdownWidth = Math.min(360, screenWidth - 32);
      }

      let rightAlignedLeft = rect.right - dropdownWidth;

      const minLeft = 16;
      const maxLeft = screenWidth - dropdownWidth - 16;

      setDropdownPosition({
        top: rect.bottom + 8,
        left: Math.min(Math.max(minLeft, rightAlignedLeft), maxLeft),
      });
    }
  };


  // Calculate position when opening and on resize
  useEffect(() => {
    if (showNotification) {
      updateDropdownPosition();

      window.addEventListener("resize", updateDropdownPosition);
      window.addEventListener("scroll", updateDropdownPosition);

      return () => {
        window.removeEventListener("resize", updateDropdownPosition);
        window.removeEventListener("scroll", updateDropdownPosition);
      };
    }
  }, [showNotification]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target) &&
        bellButtonRef.current &&
        !bellButtonRef.current.contains(event.target)
      ) {
        setShowNotification(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle Accept
  const handleAccept = async (resident) => {
    try {
      const currentAdminName = localStorage.getItem("username") || "Admin";
      const currentAdminId = localStorage.getItem("adminId");

      const res = await fetch(
        `https://software-design-g3-bhma-2026.onrender.com/api/pending-residents/accept/${resident.Pending_HR_ID}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            admin_id: currentAdminName,
            adminId: currentAdminId,
          }),
        },
      );

      const result = await res.json();

      // Call parent callback with pre-filled data
      if (onAcceptResident) {
        onAcceptResident({
          ...resident,
          Is_PWD: resident.Is_PWD == 1,
          Health_Record_ID: result.Health_Record_ID,
          Recorded_By_Name: currentAdminName,
        });
      }

      setShowNotification(false);
      fetchPending();
    } catch (err) {
      console.error("Error accepting resident:", err);
    }
  };

  // Handle Remove
  const handleRemove = async (id) => {
    const currentAdminName = localStorage.getItem("username") || "Admin";
    try {
      await fetch(
        `https://software-design-g3-bhma-2026.onrender.com/api/pending-residents/remove/${id}?admin_id=${currentAdminName}`,
        {
          method: "DELETE",
        },
      );
      fetchPending();
    } catch (err) {
      console.error("Error removing resident:", err);
    }
  };

  // Notification Dropdown Component
  const NotificationDropdown = () => (
    <div
      ref={notificationRef}
      className="notification-dropdown-portal border rounded-4 shadow-lg p-0 bg-white"
      style={{
        position: "fixed",
        top: `${dropdownPosition.top}px`,
        left: `${dropdownPosition.left}px`,
        zIndex: 2000,
      }}
    >
      <div
        className="p-3 border-bottom d-flex justify-content-between align-items-center"
        style={{ backgroundColor: "#f9fafb" }}
      >
        <h6 className="m-0 fw-bold text-uppercase small text-dark">
          Pending Requests
        </h6>
        <span className="badge bg-primary">{pendingResidents.length}</span>
      </div>
      <ul className="list-group list-group-flush notification-list">
        {pendingResidents.length > 0 ? (
          pendingResidents.map((res) => (
            <li
              key={res.Pending_HR_ID}
              className="list-group-item p-3 border-bottom"
            >
              <div className="d-flex justify-content-between align-items-center gap-2">
                <div className="small flex-grow-1 min-width-0">
                  <div className="fw-bold text-dark text-truncate">
                    {res.Resident_Name}
                  </div>
                  <div className="text-muted notification-item-subtitle text-truncate">
                    Resident ID: {res.Resident_ID}
                  </div>
                </div>
                <div className="d-flex gap-1 flex-shrink-0">
                  <button
                    className="btn btn-success btn-sm p-1 px-2"
                    title="Accept"
                    onClick={() => handleAccept(res)}
                  >
                    <i className="bi bi-check-lg"></i>
                  </button>
                  <button
                    className="btn btn-outline-danger btn-sm p-1 px-2"
                    title="Remove"
                    onClick={() => handleRemove(res.Pending_HR_ID)}
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>
                </div>
              </div>
            </li>
          ))
        ) : (
          <li className="list-group-item py-3 text-center text-muted">
            No pending residents
          </li>
        )}
      </ul>
    </div>
  );

  return (
    <>
      <div className="shadow-sm text-white d-flex align-items-center justify-content-between header-banner">
        <div className="header-content-wrapper">
          <h2 className="m-0 fw-bold text-center">
            BARANGAY HEALTH MONITORING AND ANALYTICS SYSTEM
          </h2>

          {/* BUTTONS IN HEADER */}
          <div className="d-flex align-items-center gap-2 header-buttons">
            <div className="notification-wrapper">
              <button
                ref={bellButtonRef}
                className="btn btn-light position-relative notification-bell-btn"
                onClick={() => setShowNotification(!showNotification)}
              >
                <i className="bi bi-bell"></i>
                {pendingResidents.length > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {pendingResidents.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RENDER DROPDOWN VIA PORTAL */}
      {showNotification &&
        createPortal(<NotificationDropdown />, document.body)}
    </>
  );
};

export default HeaderBanner;