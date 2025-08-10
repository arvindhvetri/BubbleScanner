# 📄 BubbleScanner – OMR Sheet Evaluation & Analytics Platform

BubbleScan is a React + Django application that scans bubble answer sheets (OMR-like), processes them to evaluate student responses, and provides interactive insights and analytics dashboards for educators and examiners.

--- 

## ✨ Features
### 🖥 Frontend (React)
**Answer Key & Image Upload** – Upload scanned bubble sheets & answer key.<br>
**Interactive Dashboard** –<br>
  - **📈 Top 5 Students**– *Line chart of top performers*<br>
  - **📊 Average Score by Subject** – *Bar chart*<br>
  - **📉 Student Score Distribution** – *Area chart*<br>
  - **🎯 Top Scorer Per Subject** – *Radar chart*<br>
  - **🥧 Subject Performance Share** – *Pie chart*<br>
  
**Students Answer Table** – View student IDs with marked answers for each question.<br>
**Score Table** – Subject-wise and total scores for all students.<br>
**Subject Analysis** – Attended, Not Attended, Correct, and Wrong answers by subject.<br>

## ⚙ Backend (Django)
- Processes scanned OMR sheets & extracts answers.<br>
- Compares extracted answers with the provided key.<br>
- Calculates per-student and per-subject statistics.<br>
- Serves processed results & analytics data to frontend via REST API.<br>

## 🛠️ Tech Stack
| Layer    | Technology                                        |
| -------- | ------------------------------------------------- |
| Frontend | React.js, Chart.js / Recharts, CSS/Bootstrap      |
| Backend  | Django, Django REST Framework                     |
| Others   | Pillow (image processing), Pandas (data handling) |

## 📸 Snapshots

![1 UploadForm](https://github.com/user-attachments/assets/193b5baf-c159-43b8-9d52-902fbdc48034)
![2 Dashboard](https://github.com/user-attachments/assets/88ede18f-00be-40d0-8d3e-f3928e116bfd)
![3 StudentsResponse](https://github.com/user-attachments/assets/e7a3cef9-5a06-4775-aa64-2872f7dee31e)
![4 ScoreTable](https://github.com/user-attachments/assets/49005a33-978d-4b09-ac5f-90cb6dad8207)
![5 SubjectAnalysis](https://github.com/user-attachments/assets/4d4c004f-df97-4ebe-82b3-086af1d93f81)
