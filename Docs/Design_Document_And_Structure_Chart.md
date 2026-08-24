## Real-Time Plant Disease Identification System Design Document using SA/SD Methodology for

## DONTHULA NITHIN TEJA (2411T028), GHANTA BHAVANA SRI SAI (2411T029), YASH ROSHAN (2411T083)

Department of Information Technology

National Institute of Technology Karnataka, Surathkal

August 10, 2026

## Contents

## 1 Data Flow Diagram (DFD) Model

## 1.1 Level 0 DFD

## 1.1.1 Context Diagram

_Figure 1: Level 0 Context Diagram_

Designer: Bhavana

## 1.2 Level 1 DFD

## 1.2.1 Top-Level Functional Decomposition

_Figure 2: Level 1 DFD with 5 functional groups_

Designer: Nithin Teja

## 1.3 Level 2 DFDs

## 1.3.1 0.1 User Registration & 2FA Authentication

_Figure 3: Level 2 DFD for 0.1 User Registration & 2FA Authentication_

Designer: Bhavana

## 1.3.2 0.2 Image Frame Capture & Preprocessing

_Figure 4: Level 2 DFD for 0.2 Image Frame Capture & Preprocessing_

Designer: Bhavana

## 1.3.3 0.3 Real-Time PyTorch Model Inference

_Figure 5: Level 2 DFD for 0.3 Real-Time PyTorch Model Inference_

Designer: Yash Roshan

## 1.3.4 0.4 Treatment Recommendation Lookup

_Figure 6: Level 2 DFD for 0.4 Treatment Recommendation Lookup_

Designer: Yash Roshan

## 1.3.5 0.5 Disease History & Media Storage Management

_Figure 7: Level 2 DFD for 0.5 Disease History & Media Storage Management_

Designer: Nithin Teja

## 2. Core Modules

This subsection outlines the various modules involved in the Real Time Plant Disease Identification System and the assigned designers for their implementation, along with listing the functional requirements (as stated in the SRS) that each module meets.

## 2.1 0.1 User Registration & 2FA Authentication

Manages user account creation, credentials-based user login validation, and mandatory two-factor authentication (2FA) through an SMS/Email challenge response process before generating a secure JWT access token.

Designer: GHANTA BHAVANA SRI SAI

Functional Requirements: Register User, Verify Credentials, Initiate 2FA, Verify 2FA OTP, Generate JWT

Token

## 2.2 0.2 Image Frame Capture and Preprocessing

Uses Browser’s MediaDevices API interface to capture webcam/mobile phone camera stream and process manual image file uploads (JPEG/PNG), standardizing frame resolutions prior to HTTP POST payloads.

Designer: GHANTA BHAVANA SRI SAI

Functional Requirements: Accessing WebCam/Smart Phone Camera, Capturing Image Frames (1-2 second intervals), MIME type validation, Preprocessing & Resizing Frame, Sending HTTP POST requests Requirements Covered: F.1, F.2, NF.1, NF.2

## 2.3 0.3 Real-Time PyTorch Model Inference

Processes Base64/Blob frames via RESTful FastAPI requests, converts image data to PyTorch Float Tensors, and performs inference through CNN model on CUDA GPU in 1-2 second latency period, and formats bounding

box outputs.

Designer: YASH ROSHAN

Functional Requirements: Accept REST Payload, Convert Image to Tensor, Run PyTorch Forward Pass, Disease

Classification with Confidence Score, Bounding Box Formation

Requirements Covered: F.3, NF.4

## 2.4 0.4 Remedy Lookup Based on Disease Classification

Uses the persistent database through querying based on the disease classification to extract remedies, chemicals, and preventative care actions.

Designer: YASH ROSHAN

Functional Requirements: Disease ID as Input, Query Persistent Database, Extract Treatments from Database,

Serialize Treatment Data to Output to UI

Requirements Covered: F.4

## 2.5 0.5 Disease History and Media Storage Management

Uploading the raw frames to Amazon Web Services Simple Storage Service for storage purposes, extracting the object URIs, and storing the information related to diagnosis (Date, Disease ID, Confidence Score, Image URI) in PostgreSQL.

Designer: DONTHULA NITHIN TEJA

Functional requirements: Upload Raw Frame to AWS S3, Extract Object URI, Write History Log Record,

Create History Dashboard Table

Requirements Covered: F.5, NF.5

## 3. Data Dictionary

## 3.1 Composite Data Items Definitions

The composite data structures of the Real-Time Plant Disease Identification System are categorized by functional subsystem:

## 3.1.1 User Registration & 2FA Authentication Composites

```
registration-data = user-name + email-address + phone-number + password-hash +
created-at
login-credentials = [ email-address , phone-number ] + password
2fa-challenge-trigger = user-id + [ email-address , phone-number ] + 2fa-otp-
code + expires-at
2fa-security-otp = 2fa-otp-code + session-id
authenticated-jwt-token = token-type + access-token-string + expires-in +
user-id
```

## 3.1.2 Image Acquisition & Preprocessing Composites

```
raw-video-stream = { video-frame-buffer }*
video-frame-buffer = timestamp + frame-height + frame-width + pixel-matrix
manual-image-file = file-name + mime-type + binary-data
validated-image-file = mime-type + binary-data + ( image-dimensions )
captured-frame-data = frame-id + timestamp + binary-data
preprocessed-frame-payload = mime-type + payload-encoding + base64-image-
string + ( capture-timestamp )
```

## 3.1.3 Deep Learning Inference Composites

```
raw-frame-bytes = byte-length + raw-bytes-stream
image-tensor-matrix = tensor-shape + tensor-data-type + tensor-values
tensor-shape = batch-size + channels + height + width /* [1, 3, 224, 224] */
class-logits-and-probabilities = { class-id + raw-logit + softmax-probability
}*
predicted-disease-name-score = disease-id + disease-name + confidence-score +
( bounding-box-coords )
inference-metadata-and-raw-image = user-id + disease-id + confidence-score +
raw-frame-bytes + capture-timestamp
```

## 3.1.4 Treatment & Remedy Lookup Composites

```
disease-lookup-query = disease-id + ( language-preference )
treatment-tabs = remedy-id + disease-id + remedy-type + title + description +
application-instructions + [ "Organic / Biological" , "Chemical / Fungicide" ,
"Preventive Cultural Practice" ]
formated-bounding-box = x-min + y-min + x-max + y-max
raw-remedy-dataset = { treatment-tabs }*
formatted-remedy-payload = disease-name + confidence-score + formated-
bounding-box + { treatment-record }*
```

## 3.1.5 Cloud Storage & Historical Logging Composites

```
s3-upload-payload = bucket-name + object-key + mime-type + raw-image-binary
s3-storage-uri = protocol-prefix + s3-bucket-name + object-path-key
diagnosis-log-record = log-id + user-id + disease-id + confidence-score + s3-
storage-uri + diagnosis-timestamp
history-log-confirmation = log-id + status-flag + timestamp
```

## 3.2 Data Store Schema Definitions

The system incorporates four persistent logical data stores. Their formal schemas and contents are defined below:

## Store D1: User DB (PostgreSQL)

```
D1: User DB = { user-account-record }*
user-account-record = user-id + user-name + email-address + phone-number +
password-hash + is-2fa-enabled + ( active-2fa-otp ) +
( otp-expiry-time ) + account-status + created-at
```

## Store D2: Disease & Remedy DB (PostgreSQL)

```
D2: Disease & Remedy DB = { disease-master-record }*
disease-master-record = disease-id + plant-species + disease-name +
scientific-name +
severity-level + { treatment-record }*
```

## Store D3: Disease History Log (PostgreSQL)

```
D3: Disease History Log = { disease-history-entry }*
disease-history-entry = log-id + user-id + disease-id + confidence-score +
s3-storage-uri + ( bounding-box-json ) + diagnosis-
timestamp
```

## Store D4: AWS S3 Object Storage

```
D4: AWS S3 Object Storage = { s3-object-record }*
s3-object-record = object-path-key + raw-image-binary + content-type + upload-
metadata
```

## 4. Structure Chart

_Figure 8: Structure Chart of the System_
