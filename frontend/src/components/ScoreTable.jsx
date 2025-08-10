// components/ScoreTable.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ScoreTable.css';

const ScoreTable = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/images/')
      .then(res => {
        const sorted = [...res.data].sort((a, b) => {
          const idA = a.evaluation_result?.student_id || '';
          const idB = b.evaluation_result?.student_id || '';
          return idA.localeCompare(idB, 'en', { numeric: true });
        });
        setData(sorted);
      })
      .catch(err => console.error(err));
  }, []);

  const downloadCSV = () => {
    const header = ['Student ID', 'Physics', 'Chemistry', 'Botany', 'Zoology', 'Total Marks'];
    const rows = data.map(img => {
      const res = img.evaluation_result || {};
      const scores = res.subject_scores || {};
      return [
        res.student_id || 'Unknown',
        scores.physics || 0,
        scores.chemistry || 0,
        scores.botany || 0,
        scores.zoology || 0,
        res.total_score || 0
      ];
    });

    const csvContent = [header, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });

    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'Score_Report.csv';
    a.click();
    URL.revokeObjectURL(a.href);

  };

  return (
    <div className="score-table-container">
      <h2 className="score-table-heading">📈 Score Table</h2>
      <div className="score-table-wrapper">
        <table className="score-table">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Physics</th>
              <th>Chemistry</th>
              <th>Botany</th>
              <th>Zoology</th>
              <th>Total Marks</th>
            </tr>
          </thead>
          <tbody>
            {data.map(img => (
              <tr key={img.id}>
                <td>{img.evaluation_result?.student_id || 'Unknown'}</td>
                <td>{img.evaluation_result?.subject_scores?.physics || 0}</td>
                <td>{img.evaluation_result?.subject_scores?.chemistry || 0}</td>
                <td>{img.evaluation_result?.subject_scores?.botany || 0}</td>
                <td>{img.evaluation_result?.subject_scores?.zoology || 0}</td>
                <td>{img.evaluation_result?.total_score || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="download-button-container">
        <button className="download-button" onClick={downloadCSV}>
          ⬇️ Download Report
        </button>
      </div>
    </div>
  );
};

export default ScoreTable;
