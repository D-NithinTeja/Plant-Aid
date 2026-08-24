## SOFTWARE REQUIREMENTS SPECIFICATION FOR

## Real-Time Plant Disease Identification

## Prepared by

## DONTHULA NITHIN TEJA (241IT028) GHANTA BHAVANA SRI SAI (241IT029) YASH ROSHAN (241IT083)

## NATIONAL INSTITUTE OF TECHNOLOGY KARNATAKA SURATHKAL DEPARTMENT OF INFORMATION TECHNOLOGY


## Table of Contents


## 1. Introduction

## 1.1 Purpose

This project aims at creating an application for Real-Time Plant Disease Identification through the Web. This application will allow farmers and gardeners to upload pictures of their plants, which will be analyzed by the AI model within seconds and possible plant diseases will be identified. The application will provide the users with a convenient and easy-to-use React.js interface available from laptops as well as mobile devices. The application will give treatment advice, keep track of disease history, and provide two-factor authentication (2FA).

## 1.2 Scope

The project will focus on developing the responsive web application and backend on the cloud for image analysis. Frontend (React.js) will capture the video frames every 1-2 seconds and send them in HTTP POST request to the backend (Python FastAPI). Backend will use the deep learning classification model using PyTorch. Data will be stored securely in PostgreSQL database and images will be stored in AWS S3. Scope consists of 2FA user authentication, near real-time image inference, treatment recommendation, and historical logging.

## 1.3 Definitions, Acronyms, and Abbreviations

| Term / Acronym | Definition |
| --- | --- |
| 2FA | Two-Factor Authentication |
| API | Application Programming Interface |
| CNN | Convolutional Neural Network |
| GUI | Graphical User Interface |
| REST | Representational State Transfer |
| SRS | Software Requirements Specification |

## 1.4 References

[1] S. C. Saon, Bangladesh Multi-Crop Disease Classification Dataset, Hugging Face, 2025. [Online]. Available: https://huggingface.co/datasets/Saon110/bd-crop-vegetable- plant-disease-dataset. [: Aug. 3, 2026]. [URL 🔗](https://huggingface.co/datasets/Saon110/bd-crop-vegetable-plant-disease-dataset?utm_source=chatgpt.com)

- [2] Paszke, A. et al. "PyTorch: An Imperative Style, High-Performance Deep Learning Library." NeurIPS, 2019.

- [3] FastAPI Documentation. [Online]. Available: https://fastapi.tiangolo.com/

- [4] React Documentation. [Online]. Available: https://react.dev/

- [5] Amazon S3 Documentation. [Online]. Available: https://aws.amazon.com/s3/


## 1.5 Overview

The subsequent sections of this document provide an extensive discussion on system requirements covering functional and non-functional requirements. This document further provides a discussion on interfaces, performance requirements, design constraints, and safety considerations, which guide the development process.

## 2. Overall Description

## 2.1 Product Perspective

Real-Time Plant Disease Identification System is an independent web application that can be used anywhere for agriculture. This system serves as a diagnostic and advice system, intended to minimize crop loss and manage plant health issues. For this system, we use scalable Python FastAPI as the back-end and PyTorch for machine learning computations and React.js as the front-end, which allows the system to have a light-weight and mobile- friendly interface compatible with modern web browsers. The system uses 2FA and stores data securely in PostgreSQL and AWS S3.

## 2.2 Product Functions

## Security & User Management

- User registration and login is protected by 2FA.

## Dataset & Inference

- Upload the images of plants.

- Analysis of near real-time camera feed (sending frames every 1-2 seconds) for detecting diseases.

## Recommendations & Tracking

- Recommend treatments and remedies.

- Track the history of diseases and monitoring for registered users.

## 2.3 User Classes

- models. Researchers/Developers: Use the system to experiment with various disease

- Learners/Students: Use the software as a learning aid for studying plant pathology.

- Domain Professionals (Farmers, Agronomists): Use the application in practice to diagnose plant diseases and get notifications for preventive care.


## 2.4 Constraints

- C.1 Internet Dependency - The application depends on an internet connection as inference is done using the ML model in a cloud backend.

- C.2 Browser Compatibility - Needs a modern browser with WebRTC enabled to access the device’s camera access.

- C.3 Hardware Constraints - Requires GPU instances in the cloud to do inference in PyTorch with minimal latency.

- C.4 Framework Lock-in - The back end needs to use FastAPI and PyTorch; data storage uses PostgreSQL and AWS S3.

- C.5 Rate Limiting – Limit each users requests per minute to prevent the server from overloading.

- C.6 File Type: Limit the MIME types to a set of predetermined file types.

## 2.5 Assumptions and Dependencies

- Users have an internet-enabled device (laptop or smartphone) with a working camera.

- The cloud backend uses cloud infrastructure provided by third parties (AWS EC2, S3, RDS).

- Users have access to an authenticator app, email, or SMS to get the 2FA code.

## 3. Specific Requirements

## 3.1 Functional Requirements

## F.1 Image Capturing/Uploading

## Description:

The application will allow the user to capture an image either by using the device’s camera or uploading the image files (JPEG/PNG).

Input: Camera feed/image file.

Output: Captured image in the UI ready for analysis.

## F.2 Near Real-Time Video Stream Analysis

## Description:

The React.js application will use JavaScript setInterval to capture frames from the video stream every 1-2 seconds and send them to the FastAPI back-end through HTTP POST request. In such way, the application is not burdened with the WebSocket state management, but it still provides near real-time inference.

Input: Base64/Blob video frames every 1-2 seconds.

Output: Real-time bounding boxes/labels on the screen.


## F.3 Disease Classification

Description: The application will classify the input image through cloud-based PyTorch model and return the predicted disease name and confidence score.

Input: Image data.

Output: Predicted disease class and its score.

## F.4 Treatment Recommendations

Description: The application will fetch the list of recommended remedies/organic treatment for the identified disease.

Input: Disease name.

Output: Remedy list.

## F.5 Disease History Logging

Description: The system will store the recorded disease, date and image id on

PostgreSQL (the actual raw image is stored on AWS S3).

Input: Inference result.

Output: Updated log of history.

## F.6 Two-Factor Authentication (2FA)

Description: The system will implement 2FA at login in order to restrict access to

personal agricultural data.

Input: User login credentials and 2FA token.

Output: Authentication session.

## 3.2 External Interface Requirements

## 3.2.1 User Interfaces

## Description:

A contemporary, responsive Graphical User Interface (GUI) implemented using React.js framework will be provided. The GUI handles 2FA prompt, preview of the camera feed, manual upload and notification alert.

Input: User actions, camera access.

## Output:

- Confirmation of the upload.

- Rendering of the dashboard, disease detection and history tables.

## 3.2.2 Hardware Interfaces

## Description:

The web application interacts with the device's camera hardware through the Browser's MediaDevices API. The cloud server will use NVIDIA CUDA supported GPUs to speed up PyTorch inference.


## 3.2.3 Software Interfaces

## Description:

The system uses multiple technology stacks:

Input: Libraries: React.js, Python FastAPI, PyTorch, PostgreSQL, AWS S3.

Output: Predictions of trained models, secure logging of data.

## 3.2.4 Communications Interfaces

## Description:

The system shall use RESTful APIs and HTTPS communication protocol. In the case of real-time processing, the frontend polls the backend using HTTP POST requests for the frame/images. Communication of the 2FA challenges shall interact with external third- party messaging services (Twilio, SendGrid).

Input: API requests with frame/images and 2FA codes.

Output: API responses with predictions and success tokens.

## 3.3 Other Non-Functional Requirements

## NF.1 Platform Requirements

Description: The system shall operate smoothly on both desktop and mobile web

browsers without installing anything locally.

## NF.2 Web Support

Description: Operable by means of standard web browser (Chrome, Safari, Firefox, Edge).

## NF.3 Secure API Access

Description: The system shall authenticate users only via JSON Web Tokens (JWT) associated with verified 2FA session. All communication shall use HTTPS encryption protocol.

## NF.4 Performance

Description: System shall provide near real-time disease detection by processing frames every 1-2 seconds through cloud backend

## NF.5 Reliability

Description: The system shall securely store disease history in Postgres and images in AWS S3 to ensure persisten and reliable data management.


## 3.4 Constraints

- Responsive UI – The frontend should be built with the implementation of React.js with responsive UI design for efficient use on both desktops and mobiles.

- API Architecture – The backend must strictly adhere to RESTful API standards using Python FastAPI for scalable communication.

- Latency Boundaries – Machine learning inferences via PyTorch must be optimized to return results within a 1-2 second window to ensure near real-time performance.

- Security Standards – User authentication must integrate Two-Factor Authentication (2FA) and utilize secure token-based access (JWT).


## Appendix A

## A.1 Block Diagram

Workflow summary: A user logs into the dashboard using 2FA authentication and accesses the React.js dashboard. The user scans the plant using his/her camera. The frontend will capture the frames at intervals of 1-2 seconds and send them to the Python FastAPI backend via REST HTTP POST. The frame is analyzed by the PyTorch model. If there is an infection detedted in the plant, it queries PostgreSQL for remedies, records the history, and saves the images to AWS S3. The output will be delivered instantly to the frontend.


## Index

A

AWS S3

B

Backend Requirements

Browser Compatibility

## C

Camera Capture

## D

Disease History

## F

FastAPI

Frontend Requirements

## P

PostgreSQL

PyTorch

## R

React.js

Real-Time Inference

## T

Two-Factor Authentication (2FA)

1.2, 2.1, 2.4, 3.1, 3.2.3, 3.4

2.4, 3.2.3, 3.4

2.4, 3.3

1.1, 1.2, 2.2, 3.1, 3.2.1

1.1, 2.2, 3.1

1.2, 2.1, 2.4, 3.2.3, 3.4

1.2, 2.1, 3.2.1, 3.4

1.2, 2.1, 2.4, 3.1, 3.2.3, 3.4

1.1, 1.2, 2.1, 2.4, 3.1, 3.2.3, 3.4

1.1, 1.2, 2.1, 3.2.1, 3.4

1.1, 1.2, 2.2, 3.1, 3.4

1.1, 1.2, 2.2, 3.1, 3.4


## Version

| Version | Last updated | Reason for change |
| --- | --- | --- |
| 1.0 | 03/08/26 | Initial Draft for Plant Disease Identification |


## Real-Time Plant Disease Identification System Design Document using SA/SD Methodology for

DONTHULA NITHIN TEJA (2411T028), GHANTA BHAVANA SRI SAI (2411T029),

YASH ROSHAN (2411T083)

Department of Information Technology

National Institute of Technology Karnataka, Surathkal

August 10, 2026


## Contents


## 1 Data Flow Diagram (DFD) Model

## 1.1 Level 0 DFD

## 1.1.1 Context Diagram

*Figure 1: Level 0 Context Diagram*


## 1.2 Level 1 DFD

## 1.2.1 Top-Level Functional Decomposition

*Figure 2: Level 1 DFD with 5 functional groups*


## 1.3 Level 2 DFDs

## 1.3.1 0.1 User Registration & 2FA Authentication

*Figure 3: Level 2 DFD for 0.1 User Registration & 2FA Authentication*

## 1.3.2 0.2 Image Frame Capture & Preprocessing

*Figure 4: Level 2 DFD for 0.2 Image Frame Capture & Preprocessing*


## 1.3.3 0.3 Real-Time PyTorch Model Inference

*Figure 5: Level 2 DFD for 0.3 Real-Time PyTorch Model Inference*

## 1.3.4 0.4 Treatment Recommendation Lookup

*Figure 6: Level 2 DFD for 0.4 Treatment Recommendation Lookup*


## 1.3.5 0.5 Disease History & Media Storage Management

*Figure 7: Level 2 DFD for 0.5 Disease History & Media Storage Management*

## 2. Core Modules

This subsection outlines the various modules involved in the Real Time Plant Disease Identification System and the assigned designers for their implementation, along with listing the functional requirements (as stated in the SRS) that each module meets.

## 2.1 0.1 User Registration & 2FA Authentication

Manages user account creation, credentials-based user login validation, and mandatory two-factor authentication (2FA) through an SMS/Email challenge response process before generating a secure JWT access token.

Designer: GHANTA BHAVANA SRI SAI

Functional Requirements: Register User, Verify Credentials, Initiate 2FA, Verify 2FA OTP, Generate JWT Token


## 2.2 0.2 Image Frame Capture and Preprocessing

Uses Browser’s MediaDevices API interface to capture webcam/mobile phone camera stream and process manual image file uploads (JPEG/PNG), standardizing frame resolutions prior to HTTP POST payloads.

Designer: GHANTA BHAVANA SRI SAI

Functional Requirements: Accessing WebCam/Smart Phone Camera, Capturing Image Frames (1-2 second intervals), MIME type validation, Preprocessing & Resizing Frame, Sending HTTP POST requests Requirements Covered: F.1, F.2, NF.1, NF.2

## 2.3 0.3 Real-Time PyTorch Model Inference

Processes Base64/Blob frames via RESTful FastAPI requests, converts image data to PyTorch Float Tensors, and performs inference through CNN model on CUDA GPU in 1-2 second latency period, and formats bounding box outputs.

Designer: YASH ROSHAN

Functional Requirements: Accept REST Payload, Convert Image to Tensor, Run PyTorch Forward Pass, Disease Classification with Confidence Score, Bounding Box Formation

Requirements Covered: F.3, NF.4

## 2.4 0.4 Remedy Lookup Based on Disease Classification

Uses the persistent database through querying based on the disease classification to extract remedies, chemicals, and preventative care actions.

Designer: YASH ROSHAN

Functional Requirements: Disease ID as Input, Query Persistent Database, Extract Treatments from Database, Serialize Treatment Data to Output to UI

Requirements Covered: F.4

## 2.5 0.5 Disease History and Media Storage Management

Uploading the raw frames to Amazon Web Services Simple Storage Service for storage purposes, extracting the object URIs, and storing the information related to diagnosis (Date, Disease ID, Confidence Score, Image URI) in PostgreSQL.

Designer: DONTHULA NITHIN TEJA

Functional requirements: Upload Raw Frame to AWS S3, Extract Object URI, Write History Log Record,

Create History Dashboard Table

Requirements Covered: F.5, NF.5
