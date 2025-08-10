// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ImageUploadForm from './components/ImageUploadForm';
import EvaluationResult from './components/EvaluationResult'; // Corrected component name
import StudentAnswers from './components/StudentAnswers';
import ScoreTable from './components/ScoreTable';
import Layout from './components/Layout';
import SubjectAnalysis from './components/SubjectAnalysis';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ImageUploadForm />} />
        <Route path="/results" element={<Layout />}>
          <Route index element={<EvaluationResult />} />
          <Route path="answers" element={<StudentAnswers />} />
          <Route path="scores" element={<ScoreTable />} />
          <Route path="subject-analysis" element={<SubjectAnalysis />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
