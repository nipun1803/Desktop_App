import React from 'react';

export default function ProfileInputs({ studentName, setStudentName, studentId, setStudentId }) {
  return (
    <div className="profile-inputs-card">
      <div className="input-group">
        <label htmlFor="student-name">Student Name:</label>
        <input
          id="student-name"
          type="text"
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
          className="form-input"
        />
      </div>
      <div className="input-group">
        <label htmlFor="student-id">Student ID:</label>
        <input
          id="student-id"
          type="text"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          className="form-input"
        />
      </div>
    </div>
  );
}
