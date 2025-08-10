# django_backend/evaluation_app/process_omr.py
import cv2
import numpy as np
import os
import json

def parse_answer_key_file(file_path):
    """
    Parses a text file containing the answer key.
    Assumes the format is 'question_number: answer_choice' per line, e.g., '1: A', '2: B'.
    Returns a dictionary mapping question numbers (int) to their correct answers (str).
    """
    answers = {}
    try:
        with open(file_path, 'r') as file:
            for line in file:
                line = line.strip()
                if line:
                    try:
                        question_str, answer = line.split(': ')
                        question_num = int(question_str)
                        answers[question_num] = answer.strip().upper()
                    except ValueError:
                        print(f"Skipping malformed line in answer key: {line}")
                        continue
        # Ensure answers are sorted by question number for consistent processing
        return dict(sorted(answers.items()))
    except Exception as e:
        raise ValueError(f"Error parsing answer key file '{file_path}': {str(e)}")

def get_marked_answers(image_segment, num_rows, num_cols, min_area_threshold=10):
    """
    Helper function to process a segment of the OMR sheet (e.g., Physics, Chemistry section)
    and return the detected marked answers.

    Args:
        image_segment (numpy.ndarray): The cropped image segment (e.g., Physics section).
        num_rows (int): Expected number of rows (questions) in this segment.
        num_cols (int): Expected number of columns (answer choices A, B, C, D).
        min_area_threshold (int): Minimum contour area to consider a marked bubble.

    Returns:
        dict: A dictionary mapping question index (0-based) to the detected answer (A, B, C, D, or 'X' for unmarked, 'M' for multiple).
    """
    if image_segment is None or image_segment.size == 0:
        return {}

    # Convert to grayscale and apply inverse binary threshold
    gray = cv2.cvtColor(image_segment, cv2.COLOR_BGR2GRAY)
    _, thresh = cv2.threshold(gray, 30, 255, cv2.THRESH_BINARY_INV)

    # Find contours
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    # Calculate approximate cell dimensions
    row_height = int(image_segment.shape[0] / num_rows)
    col_width = int(image_segment.shape[1] / num_cols)

    marked_centroids = [] # Stores (col_index, row_index) of marked bubbles

    for contour in contours:
        area = cv2.contourArea(contour)
        if area > min_area_threshold:
            M = cv2.moments(contour)
            if M['m00'] != 0:
                cx = int(M['m10'] / M['m00'])
                cy = int(M['m01'] / M['m00'])

                # Determine the grid cell (box) where the centroid lies
                cell_row = cy // row_height
                cell_col = cx // col_width

                # Ensure the cell indices are within bounds
                if 0 <= cell_row < num_rows and 0 <= cell_col < num_cols:
                    marked_centroids.append((cell_col, cell_row))
    
    # Sort by row (question number) then by column (answer choice)
    marked_centroids_sorted = sorted(marked_centroids, key=lambda x: (x[1], x[0]))

    # Map column index to answer choice
    col_to_answer = {0: 'A', 1: 'B', 2: 'C', 3: 'D'}

    # Initialize all answers as 'X' (unmarked)
    detected_answers = {i: 'X' for i in range(num_rows)}

    # Populate detected answers based on first detected bubble only
    for col_idx, row_idx in marked_centroids_sorted:
        if detected_answers[row_idx] == 'X':
            detected_answers[row_idx] = col_to_answer.get(col_idx, 'X')  # Assign first detected
        # Else: keep the first detected answer and ignore others

    return detected_answers


def process_omr_sheet(image_path, answer_key_data):
    """
    Processes a single OMR sheet image, extracts student ID, exam ID,
    and marked answers for subjects, then evaluates them against the answer key.

    Args:
        image_path (str): The full path to the OMR sheet image file.
        answer_key_data (dict): A dictionary of correct answers, e.g., {1: 'A', 2: 'B'}.

    Returns:
        dict: A dictionary containing evaluation results, including:
              - student_id (str)
              - exam_id (str)
              - subject_scores (dict)
              - total_score (int)
              - subject_details (dict of lists of dicts)
              - errors (list of str) if any issues occurred.
    """
    results = {
        "student_id": "",
        "exam_id": "",
        "subject_scores": {
            "physics": 0,
            "chemistry": 0,
            "botany": 0,
            "zoology": 0
        },
        "total_score": 0,
        "subject_details": {
            "physics": [],
            "chemistry": [],
            "botany": [],
            "zoology": []
        },
        "errors": []
    }

    try:
        omr = cv2.imread(image_path)
        if omr is None:
            results["errors"].append(f"Failed to load image: {image_path}")
            return results

        # Define regions of interest (ROIs) - these are critical and depend on your OMR sheet layout
        # These coordinates are taken directly from your provided script
        # Adjust these values based on your specific OMR sheet design
        StudentID_roi = omr[855:1170, 130:450]
        ExamID_roi = omr[1289:1602, 165:440]
        Physics_roi = omr[515:2070, 540:715]
        Chemistry_roi = omr[515:2070, 810:980]
        Botany_roi = omr[515:2070, 1080:1250]
        Zoology_roi = omr[515:2070, 1350:1520]

        # --- Process Student ID ---
        stuIdWidthImg = 350
        stuIdHeightImg = 750 # Adjusted from original script's stuIdWidthImg for clarity
        stuIdRows = 10
        stuIdCols = 7
        
        # Resize for consistent processing
        resizedStuIdImg = cv2.resize(StudentID_roi, (stuIdWidthImg, stuIdHeightImg))
        gray_stu_id = cv2.cvtColor(resizedStuIdImg, cv2.COLOR_BGR2GRAY)
        _, thresh_stu_id = cv2.threshold(gray_stu_id, 30, 255, cv2.THRESH_BINARY_INV)
        
        contours_stu_id, _ = cv2.findContours(thresh_stu_id, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        stu_id_marked_digits = []
        row_height_stu_id = resizedStuIdImg.shape[0] // stuIdRows
        col_width_stu_id = resizedStuIdImg.shape[1] // stuIdCols

        for contour in contours_stu_id:
            area = cv2.contourArea(contour)
            if area > 10: # Filter out small contours
                M = cv2.moments(contour)
                if M['m00'] != 0:
                    cx = int(M['m10'] / M['m00'])
                    cy = int(M['m01'] / M['m00'])
                    
                    row_idx = cy // row_height_stu_id
                    col_idx = cx // col_width_stu_id
                    
                    if 0 <= row_idx < stuIdRows and 0 <= col_idx < stuIdCols:
                        stu_id_marked_digits.append((col_idx, row_idx)) # (column, row) to sort by column first

        # Sort by column, then by row to reconstruct the ID
        stu_id_marked_digits_sorted = sorted(stu_id_marked_digits, key=lambda x: x[0])
        enteredStuId = "".join([str(digit_row) for _, digit_row in stu_id_marked_digits_sorted])
        results["student_id"] = enteredStuId

        # --- Process Exam ID ---
        examIdWidthImg = 350
        examIdHeightImg = 750 # Adjusted from original script's examIdWidthImg for clarity
        examIdRows = 10
        examIdCols = 5

        resizedExamIdImg = cv2.resize(ExamID_roi, (examIdWidthImg, examIdHeightImg))
        gray_exam_id = cv2.cvtColor(resizedExamIdImg, cv2.COLOR_BGR2GRAY)
        _, thresh_exam_id = cv2.threshold(gray_exam_id, 30, 255, cv2.THRESH_BINARY_INV)

        contours_exam_id, _ = cv2.findContours(thresh_exam_id, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        exam_id_marked_digits = []
        row_height_exam_id = resizedExamIdImg.shape[0] // examIdRows
        col_width_exam_id = resizedExamIdImg.shape[1] // examIdCols

        for contour in contours_exam_id:
            area = cv2.contourArea(contour)
            if area > 10:
                M = cv2.moments(contour)
                if M['m00'] != 0:
                    cx = int(M['m10'] / M['m00'])
                    cy = int(M['m01'] / M['m00'])

                    row_idx = cy // row_height_exam_id
                    col_idx = cx // col_width_exam_id
                    
                    if 0 <= row_idx < examIdRows and 0 <= col_idx < examIdCols:
                        exam_id_marked_digits.append((col_idx, row_idx)) # (column, row)

        exam_id_marked_digits_sorted = sorted(exam_id_marked_digits, key=lambda x: x[0])
        enteredExamId = "".join([str(digit_row) for _, digit_row in exam_id_marked_digits_sorted])
        results["exam_id"] = enteredExamId


        # --- Process Subject Answers ---
        subWidthImg = 200
        subHeightImg = 1000
        subRows = 50 # 50 questions per subject
        subCols = 4  # A, B, C, D

        subjects = {
            "physics": Physics_roi,
            "chemistry": Chemistry_roi,
            "botany": Botany_roi,
            "zoology": Zoology_roi
        }

        total_score = 0
        for subject_name, roi in subjects.items():
            if roi is None or roi.size == 0:
                results["errors"].append(f"ROI for {subject_name} is invalid or empty.")
                continue

            # Resize ROI for consistent processing
            resized_roi = cv2.resize(roi, (subWidthImg, subHeightImg))
            
            # Get marked answers for the current subject
            detected_answers_for_subject = get_marked_answers(resized_roi, subRows, subCols)
            
            subject_score = 0
            subject_details_list = []

            for q_idx in range(subRows): # Iterate through all 50 questions (0-49)
                question_num_in_key = q_idx + 1 # Answer key uses 1-based indexing
                
                detected_ans = detected_answers_for_subject.get(q_idx, 'X') # 'X' if not detected
                correct_ans = answer_key_data.get(question_num_in_key, None)

                is_correct = False
                if correct_ans is not None:
                    if detected_ans == correct_ans:
                        is_correct = True
                        subject_score += 4
                    elif detected_ans in ['A', 'B', 'C', 'D']:  # Answered but incorrect
                        is_correct = False
                        subject_score -= 1
                    else:
                        is_correct = False  # 'X' or 'M' → No marks
                
                subject_details_list.append({
                    "question": question_num_in_key,
                    "detected_answer": detected_ans,
                    "correct_answer": correct_ans if correct_ans is not None else "N/A",
                    "is_correct": is_correct
                })

            results["subject_scores"][subject_name] = subject_score
            results["subject_details"][subject_name] = subject_details_list
            total_score += subject_score
        
        results["total_score"] = total_score

        # --- Flatten subject answers into a single flat dictionary of 1-200 ---
        flat_answers = {}
        question_offset = 0

        for subject_name in ['physics', 'chemistry', 'botany', 'zoology']:
            for detail in results["subject_details"][subject_name]:
                question_number = detail["question"] + question_offset
                flat_answers[question_number] = detail["detected_answer"]
            question_offset += 50

        results["answers"] = flat_answers

    except Exception as e:
        results["errors"].append(f"An unexpected error occurred during OMR processing: {str(e)}")

    return results

