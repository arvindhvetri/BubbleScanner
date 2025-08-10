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

## 📸 Output
[BubbleScanner.pdf](https://github.com/user-attachments/files/21704612/BubbleScanner.pdf)

