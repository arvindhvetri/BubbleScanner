// components/StudentAnswers.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './StudentAnswers.css';

const StudentAnswers = () => {
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/images/')
      .then(res => {
        // Sort by student_id (roll number) ascending
        const sorted = [...res.data].sort((a, b) => {
          const idA = a.evaluation_result?.student_id || '';
          const idB = b.evaluation_result?.student_id || '';
          return idA.localeCompare(idB, 'en', { numeric: true });
        });
        setAnswers(sorted);
      })
      .catch(err => console.error(err));
  }, []);

  const questionNumbers = Array.from({ length: 200 }, (_, i) => i + 1);

  const downloadCSV = () => {
    let csv = ['Roll No,' + questionNumbers.join(',')];

    answers.forEach(img => {
      const roll = img.evaluation_result?.student_id || 'Unknown';
      const row = questionNumbers.map(q => img.evaluation_result?.answers?.[q] || '-');
      csv.push(`${roll},${row.join(',')}`);
    });

    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'student_answers_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="student-answers-container">
      <div className="top-bar">
        <h2 className="student-answers-heading">📝 Student Answers</h2>
      </div>

      <div className="table-wrapper">
        <table className="student-answers-table">
          <thead>
            <tr>
              <th>Roll No</th>
              {questionNumbers.map(num => (
                <th key={num}>{num}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {answers.map(img => (
              <tr key={img.id}>
                <td>{img.evaluation_result?.student_id || 'Unknown'}</td>
                {questionNumbers.map(num => (
                  <td key={num}>{img.evaluation_result?.answers?.[num] || '-'}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="download-button-wrapper">
        <button className="download-button" onClick={downloadCSV}>
          ⬇️ Download Report
        </button>
      </div>
    </div>
  );
};

export default StudentAnswers;
