import React from 'react';

const RecordsPage = () => {
  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold">Patient Records</h3>
        <button className="btn btn-primary">+ Add New Record</button>
      </div>
      
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <table className="table table-hover">
            <thead className="table-light">
              <tr>
                <th>Name</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Last Visit</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="5" className="text-center py-5 text-muted">
                  No health records found. Click "Add New Record" to start.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RecordsPage;