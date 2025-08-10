// components/SubjectAnalysis.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './SubjectAnalysis.css';

const SubjectAnalysis = () => {
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

  const countStats = (subjectDetails = []) => {
    let attended = 0, correct = 0, wrong = 0;
    for (const q of subjectDetails) {
      if (q.detected_answer && q.detected_answer !== 'X') attended++;
      if (q.is_correct) correct++;
      if (!q.is_correct && q.detected_answer && q.detected_answer !== 'X') wrong++;
    }
    const notAttended = subjectDetails.length - attended;
    return { attended, notAttended, correct, wrong };
  };

  const downloadCSV = () => {
    const headers = [
      'Student ID',
      'Physics Attended', 'Physics Not Attended', 'Physics Correct', 'Physics Wrong',
      'Chemistry Attended', 'Chemistry Not Attended', 'Chemistry Correct', 'Chemistry Wrong',
      'Botany Attended', 'Botany Not Attended', 'Botany Correct', 'Botany Wrong',
      'Zoology Attended', 'Zoology Not Attended', 'Zoology Correct', 'Zoology Wrong',
    ];

    const rows = data.map(img => {
      const res = img.evaluation_result || {};
      const subjects = res.subject_details || {};

      const studentId = res.student_id || 'Unknown';
      const stats = ['physics', 'chemistry', 'botany', 'zoology'].flatMap(sub => {
        const s = countStats(subjects[sub]);
        return [s.attended, s.notAttended, s.correct, s.wrong];
      });

      return [studentId, ...stats].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'subject_analysis_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="subject-analysis-container">
      <h2 className="analysis-heading">📊 Student Subject-wise Analysis</h2>
      <div className="table-scroll-wrapper">
        <table className="analysis-table">
          <thead>
            <tr>
              <th rowSpan="2">Student ID</th>
              {['Physics', 'Chemistry', 'Botany', 'Zoology'].map(subject => (
                <th key={subject} colSpan="4">{subject}</th>
              ))}
            </tr>
            <tr>
              {Array(4).fill(['Attended', 'Not Attended', 'Correct', 'Wrong']).flat().map((title, index) => (
                <th key={index}>{title}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map(img => {
              const res = img.evaluation_result || {};
              const subjects = res.subject_details || {};
              return (
                <tr key={img.id}>
                  <td>{res.student_id || 'Unknown'}</td>
                  {['physics', 'chemistry', 'botany', 'zoology'].map(sub => {
                    const stats = countStats(subjects[sub]);
                    return (
                      <React.Fragment key={sub}>
                        <td>{stats.attended}</td>
                        <td>{stats.notAttended}</td>
                        <td>{stats.correct}</td>
                        <td>{stats.wrong}</td>
                      </React.Fragment>
                    );
                  })}
                </tr>
              );
            })}
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

export default SubjectAnalysis;
