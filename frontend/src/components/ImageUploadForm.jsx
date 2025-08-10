// react_frontend/src/components/ImageUploadForm.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './ImageUploadForm.css';
// import EvaluationResults from './EvaluationResults'; // This component is no longer directly rendered here

const ImageUploadForm = () => {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [answerKeyFile, setAnswerKeyFile] = useState(null);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [uploadedImages, setUploadedImages] = useState([]);
    const [evaluationMessage, setEvaluationMessage] = useState('');
    const [evaluationMessageType, setEvaluationMessageType] = useState('');
    const [testId, setTestId] = useState('');
    const [testName, setTestName] = useState('');
    const navigate = useNavigate();

    const API_BASE_URL = 'http://127.0.0.1:8000/api';

    useEffect(() => {
        // Clear states on component mount for a fresh start or re-evaluation cycle
        setSelectedFiles([]);
        setAnswerKeyFile(null);
        setMessage('');
        setMessageType('');
        setEvaluationMessage('');
        setEvaluationMessageType('');
        // Fetch images initially to display any previously uploaded ones
        fetchImages();
    }, []); // Empty dependency array means this runs once on mount

    const fetchImages = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/images/`);
            setUploadedImages(res.data);
        } catch (err) {
            setMessage('Failed to load images from server.');
            setMessageType('error');
            console.error("Error fetching images:", err);
        }
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        // Limit to 60 files as per your UI hint
        if (selectedFiles.length + files.length > 60) {
            setMessage('You can select a maximum of 60 images.');
            setMessageType('error');
            return;
        }
        const newFiles = files.map(file => ({
            file,
            preview: URL.createObjectURL(file) // Create URL for image preview
        }));
        setSelectedFiles(prev => [...prev, ...newFiles]);
        setMessage(''); // Clear previous messages
        setMessageType('');
    };

    const handleAnswerKeyChange = (e) => {
        setAnswerKeyFile(e.target.files[0]);
        setMessage(''); // Clear previous messages
        setMessageType('');
    };

    const handleDeletePreview = (index) => {
        const updated = [...selectedFiles];
        // Revoke the object URL to free up memory when a preview is deleted
        URL.revokeObjectURL(updated[index].preview);
        updated.splice(index, 1);
        setSelectedFiles(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        setMessage('');
        setMessageType('');
        setEvaluationMessage('');
        setEvaluationMessageType('');

        // Validate Test ID and Test Name
        if (!testId || !testName) {
            setMessage('Please enter Test ID and Test Name.');
            setMessageType('error');
            return;
        }

        // Validate image selection
        if (selectedFiles.length === 0) {
            setMessage('Please select at least one image.');
            setMessageType('error');
            return;
        }

        // Validate answer key file selection
        if (!answerKeyFile) {
            setMessage('Please upload the answer key file.');
            setMessageType('error');
            return;
        }

        try {
            // 1. Upload Answer Key First
            const answerForm = new FormData();
            answerForm.append('file', answerKeyFile); // 'file' matches the model field name in Django
            answerForm.append('test_id', testId); // Append test_id
            answerForm.append('test_name', testName); // Append test_name

            await axios.post(`${API_BASE_URL}/upload-answer-key/`, answerForm, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            // 2. Upload Images
            // Loop through selected files and upload each one
            for (let i = 0; i < selectedFiles.length; i++) {
                const formData = new FormData();
                formData.append('image', selectedFiles[i].file); // 'image' matches the model field name in Django
                formData.append('title', selectedFiles[i].file.name); // Use file name as title
                formData.append('test_id', testId); // Append test_id to each image upload
                formData.append('test_name', testName); // Append test_name to each image upload

                await axios.post(`${API_BASE_URL}/images/`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            setMessage('Answer key and images uploaded successfully! Initiating evaluation...');
            setMessageType('success');
            
            // Clear form states after successful upload
            setSelectedFiles([]);
            setAnswerKeyFile(null);
            setTestId(''); // Clear test ID input
            setTestName(''); // Clear test Name input
            // Reset file input values visually
            document.getElementById('image').value = '';
            document.getElementById('answerKey').value = '';
            
            // Refresh the list of uploaded images to show them in the gallery
            await fetchImages();

            // Automatically trigger evaluation after successful upload
            setEvaluationMessage('Evaluation in progress...');
            setEvaluationMessageType('info');
            try {
                // The backend will evaluate all pending images against the latest answer key
                await axios.post(`${API_BASE_URL}/evaluate-images/`);
                setEvaluationMessage('Evaluation completed successfully!');
                setEvaluationMessageType('success');
                // After successful evaluation, navigate to the results page
                navigate('/results');
            } catch (err) {
                console.error("Evaluation error:", err.response?.data || err.message);
                setEvaluationMessage(`Evaluation failed: ${err.response?.data?.error || err.message}.`);
                setEvaluationMessageType('error');
            }

        } catch (err) {
            console.error("Upload error:", err.response?.data || err.message);
            setMessage(`Upload failed: ${err.response?.data?.error || err.message}. Please try again.`);
            setMessageType('error');
        }
    };

    // handleDownloadReport function removed as requested

    return (
        <div className="upload-gallery-container">
            <div className="upload-column">
                <h1 className="main-heading">📝 EvalEase</h1>
                <p className="sub-heading">Upload your Bubble Sheets here.</p>

                <form onSubmit={handleSubmit} className="upload-form">

                    <div className="form-group">
                        <label htmlFor="testId" className="form-label">Test ID</label>
                        <input
                            type="text"
                            id="testId"
                            value={testId}
                            onChange={(e) => setTestId(e.target.value)}
                            className="form-input"
                            placeholder="e.g., TEST2025"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="testName" className="form-label">Test Name</label>
                        <input
                            type="text"
                            id="testName"
                            value={testName}
                            onChange={(e) => setTestName(e.target.value)}
                            className="form-input"
                            placeholder="e.g., Final Term Biology"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="image" className="form-label">
                            Choose Images: <span className="max-info">(Max : 60)</span>
                        </label>
                        <input
                            type="file"
                            id="image"
                            onChange={handleFileChange}
                            accept="image/*"
                            multiple
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="answerKey" className="form-label">
                            Upload Answer Key : <span className="max-info">(.txt)</span>
                        </label>
                        <input
                            type="file"
                            id="answerKey"
                            onChange={handleAnswerKeyChange}
                            accept=".txt"
                            className="form-input"
                        />
                        {answerKeyFile && <p className="file-name">Selected: {answerKeyFile.name}</p>}
                    </div>

                    <div className="form-buttons">
                        <button type="submit" className="upload-button">Upload & Evaluate</button>
                        {/* Download Report button removed as requested */}
                    </div>

                    {message && <p className={`status-message ${messageType}`}>{message}</p>}
                    {evaluationMessage && <p className={`status-message ${evaluationMessageType}`}>{evaluationMessage}</p>}
                </form>
            </div>

            <div className="gallery-column">
                <h2 className="section-heading">🖼️ Selected Images</h2>

                {selectedFiles.length > 0 && (
                    <>
                        <p className="preview-info">📤 Selected Bubble Sheets</p>
                        <div className="image-grid">
                            {selectedFiles.map((item, idx) => (
                                <div key={idx} className="image-card">
                                    <img src={item.preview} alt="Preview" className="card-image" />
                                    <div className="card-info">
                                        <h3 className="card-title">{item.file.name}</h3>
                                        <button
                                            type="button"
                                            className="delete-button"
                                            onClick={() => handleDeletePreview(idx)}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {uploadedImages.filter(img => !img.evaluation_result).length > 0 && (
                    <>
                        <p className="preview-info">📤 Uploaded Sheets (Pending Evaluation)</p>
                        <div className="image-grid">
                            {uploadedImages.filter(img => !img.evaluation_result).map(img => (
                                <div key={img.id} className="image-card">
                                    <img
                                        src={`http://127.0.0.1:8000${img.image}`}
                                        alt={img.title || 'Image'}
                                        className="card-image"
                                    />
                                    <div className="card-info">
                                        <h3 className="card-title">{img.title || `Image #${img.id}`}</h3>
                                        <p className="pending-evaluation">Pending Evaluation</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ImageUploadForm;
