# ShadowWatch AI - REST API Documentation

Base URL: `http://localhost:8000/api/v1`

---

## 1. System Endpoints

### `GET /health`
Returns system health, backend version, database connectivity mode, and model load status.

**Response:**
```json
{
  "status": "healthy",
  "version": "2.5.0-ENTERPRISE",
  "database": "In-Memory Store (Fallback Active)",
  "model_loaded": true
}
```

### `GET /model/status`
Returns Isolation Forest model status, contamination rate, and feature names.

**Response:**
```json
{
  "is_trained": true,
  "contamination": 0.05,
  "features_count": 15,
  "feature_names": [
    "login_hour", "day_of_week", "weekend_login", "working_hour_flag",
    "session_duration_hours", "usb_frequency", "usb_transfer_mb",
    "app_entropy", "file_entropy", "login_variance", "session_variance",
    "avg_upload_mb", "avg_download_mb", "avg_file_access", "application_count"
  ],
  "last_trained_timestamp": "2026-07-24 22:30:00"
}
```

---

## 2. Data & Model Pipeline

### `POST /upload_dataset`
Uploads custom Excel (`.xlsx`) or CSV dataset and runs 5-Stage Validation Pipeline (`Upload` -> `Schema Validation` -> `Column Validation` -> `Data Profiling` -> `Preview` -> `Store`).

### `POST /train`
Triggers full data loader, feature engineering, profile engine baselines, Isolation Forest model training, and SHAP explainer initialization.

---

## 3. Threat Intelligence & Analytics

### `POST /predict`
Evaluates single user log event against active Isolation Forest model and 5-Factor Risk Engine.

**Request Payload:**
```json
{
  "employee_id": "EMP001",
  "department": "Engineering",
  "login_time": "2026-07-24 22:15:00",
  "session_duration_hours": 9.5,
  "upload_mb": 450.0,
  "download_mb": 120.0,
  "usb_connected": true,
  "files_accessed": 40
}
```

### `GET /risk`
Retrieves sorted behavioral risk scores across employees and departments.

### `GET /explain/{employee_id}`
Computes SHAP feature contribution drivers for specified employee.

### `POST /report`
Generates token-optimized AI SOC Copilot investigation report using Google Gemini API.

### `GET /dashboard`
Provides aggregated dashboard metrics, threat severity distributions, and live threat feed.

### `GET /graph`
Returns Behavioral Knowledge Graph JSON payload (9 node types, 7 edge types).

### `GET /employees/{employee_id}/dna`
Returns 6D Behavior DNA profile payload (`Login`, `Session`, `App`, `USB`, `Network`, `File` patterns).
