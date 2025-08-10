// components/EvaluationResult.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  BarChart, Bar,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import './EvaluationResult.css'; // Ensure this CSS file is imported

const EvaluationResult = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const res = await axios.get('http://127.0.0.1:8000/api/images/');
        setData(res.data);
      } catch (err) {
        console.error("Error fetching evaluation results:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  // --- Data Preparation for Charts ---

  // Line Chart: Top 5 Students by Total Score
  const top10 = [...data]
    .filter(d => d.evaluation_result && d.evaluation_result.total_score !== undefined)
    .sort((a, b) => b.evaluation_result.total_score - a.evaluation_result.total_score)
    .slice(0, 5)
    .map((d, index) => ({
      name: d.evaluation_result.student_id || `Student ${index + 1}`,
      total: d.evaluation_result.total_score || 0
    }));

  // Bar Chart & Pie Chart: Average Subject Scores
  const subjectTotals = { physics: 0, chemistry: 0, botany: 0, zoology: 0 };
  let studentCountWithScores = 0;

  data.forEach(img => {
    const scores = img.evaluation_result?.subject_scores;
    if (scores) {
      subjectTotals.physics += scores.physics || 0;
      subjectTotals.chemistry += scores.chemistry || 0;
      subjectTotals.botany += scores.botany || 0;
      subjectTotals.zoology += scores.zoology || 0;
      studentCountWithScores++; // Only count students who have subject scores
    }
  });

  const avgSubjectScores = Object.entries(subjectTotals).map(([subject, total]) => ({
    subject: subject.charAt(0).toUpperCase() + subject.slice(1), // Capitalize subject name
    average: studentCountWithScores > 0 ? parseFloat((total / studentCountWithScores).toFixed(2)) : 0
  }));

  // Area Chart: Score Distribution (Histogram-like)
  const scoreRanges = {
    '0-25': 0,
    '26-50': 0,
    '51-75': 0,
    '76-100': 0,
  };

  data.forEach(d => {
    if (d.evaluation_result && d.evaluation_result.total_score !== undefined) {
      const score = d.evaluation_result.total_score;
      if (score >= 0 && score <= 25) scoreRanges['0-25']++;
      else if (score >= 26 && score <= 50) scoreRanges['26-50']++;
      else if (score >= 51 && score <= 75) scoreRanges['51-75']++;
      else if (score >= 76 && score <= 100) scoreRanges['76-100']++;
    }
  });

  const scoreDistributionData = Object.entries(scoreRanges).map(([range, count]) => ({
    range,
    students: count,
  }));

  // Radar Chart: Top Student per Subject
  const topStudentPerSubject = {};
  ['physics', 'chemistry', 'botany', 'zoology'].forEach(subject => {
    let maxScore = 0; // Initialize with 0 for scores
    let topStudentId = 'N/A';

    data.forEach(d => {
      const scores = d.evaluation_result?.subject_scores;
      if (scores && scores[subject] !== undefined) {
        if (scores[subject] > maxScore) {
          maxScore = scores[subject];
          topStudentId = d.evaluation_result.student_id || `Student ${d.id}`; // Use image ID as fallback
        }
      }
    });

    topStudentPerSubject[subject] = {
      subject: subject.charAt(0).toUpperCase() + subject.slice(1),
      score: maxScore, // Use maxScore directly
      student: topStudentId,
    };
  });

  const topSubjectPerformersData = Object.values(topStudentPerSubject);

  // Custom colors for Pie Chart
  const PIE_COLORS = ['#6366F1', '#22C55E', '#F97316', '#EF4444']; // Indigo, Green, Orange, Red

  return (
    // Outermost div for overall page centering and background
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      {/* Dashboard Title and Description - Now outside the grid container */}
      <div className="text-center mb-8 w-full max-w-5xl mx-auto "> {/* Added mx-auto and max-w for centering */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-2 sm:mb-4 leading-tight">
          <span className="text-blue-600">📑</span> Evaluation Dashboard
        </h1>
        <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6">
          Dive into the comprehensive evaluation results for all students.
        </p>
      </div>

      {/* Main dashboard container with grid layout and custom styling */}
      <div className="evaluation-dashboard-container">
        {loading && (
          <div className="col-span-full text-center text-blue-500 text-lg font-medium py-10">
            Loading evaluation results...
          </div>
        )}

        {error && (
          <div className="col-span-full text-center text-red-600 text-lg font-medium py-10">
            Error loading data. Please ensure the backend server is running and accessible.
            <p className="text-sm text-red-500 mt-2">{error.message}</p>
          </div>
        )}

        {!loading && !error && data.length === 0 && (
          <div className="col-span-full text-center text-gray-500 text-lg font-medium py-10">
            No evaluation data available. Please upload answer sheets first.
          </div>
        )}

        {!loading && !error && data.length > 0 && (
          <>
            {/* Top 10 Students by Total Score (LineChart) */}
            <div className="chart-section">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-700 mb-4 flex items-center gap-2">
                <span className="text-yellow-500">🏆</span> Top 5 Students (Total Score)
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={top10} margin={{ top: 10, right: 30, left: 20, bottom: 50 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} stroke="#555" />
                  <YAxis stroke="#555" />
                  <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Line type="monotone" dataKey="total" stroke="#6366F1" strokeWidth={3} dot={{ r: 6, fill: '#6366F1', stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 8 }} name="Total Score" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Average Score by Subject (BarChart) */}
            <div className="chart-section">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-700 mb-4 flex items-center gap-2">
                <span className="text-indigo-500">📚</span> Average Score by Subject
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={avgSubjectScores} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="subject" stroke="#555" />
                  <YAxis stroke="#555" />
                  <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="average" fill="#22C55E" name="Average Score" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Score Distribution (AreaChart) */}
            <div className="chart-section">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-700 mb-4 flex items-center gap-2">
                <span className="text-purple-500">📊</span> Student Score Distribution
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={scoreDistributionData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="range" stroke="#555" />
                  <YAxis allowDecimals={false} stroke="#555" />
                  <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Area type="monotone" dataKey="students" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorStudents)" name="Number of Students" />
                  {/* Define gradient for AreaChart fill */}
                  <defs>
                    <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Top Scorer Per Subject (RadarChart) */}
            <div className="chart-section">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-700 mb-4 flex items-center gap-2">
                <span className="text-teal-500">🌟</span> Top Scorer Per Subject
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart outerRadius={90} data={topSubjectPerformersData}>
                  <PolarGrid stroke="#e0e0e0" />
                  <PolarAngleAxis dataKey="subject" stroke="#555" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#555" /> {/* Assuming max score is 100 */}
                  <Tooltip formatter={(value) => [`Score: ${value}`]} /> {/* Simplified tooltip */}
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Radar name="Highest Score" dataKey="score" stroke="#14B8A6" fill="#14B8A6" fillOpacity={0.6} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Subject Performance Share (Pie Chart) */}
            <div className="chart-section">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-700 mb-4 flex items-center gap-2">
                <span className="text-green-500">🎯</span> Subject Performance Share
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={avgSubjectScores}
                    dataKey="average"
                    nameKey="subject"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {avgSubjectScores.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                </PieChart>
              </ResponsiveContainer>
              
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EvaluationResult;
