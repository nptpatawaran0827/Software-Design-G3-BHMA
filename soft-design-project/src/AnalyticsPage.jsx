import React from 'react';

const AnalyticsPage = () => {
  return (
    <div className="p-4">
      <h3 className="fw-bold mb-4">Health Analytics</h3>
      
      <div className="row g-4">
        {/* Example Stat Cards */}
        {['Total Patients', 'Monthly Consultations', 'Immunizations'].map((stat) => (
          <div className="col-md-4" key={stat}>
            <div className="card border-0 shadow-sm p-4 text-center">
              <h6 className="text-muted mb-2">{stat}</h6>
              <h2 className="fw-bold mb-0">0</h2>
            </div>
          </div>
        ))}
      </div>

      <div className="card border-0 shadow-sm mt-4 p-5 text-center text-muted">
        <p>Charts and data visualizations will appear here once data is collected.</p>
      </div>
    </div>
  );
};

export default AnalyticsPage;