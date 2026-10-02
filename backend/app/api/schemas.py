from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional

class HealthResponse(BaseModel):
    status: str
    version: str
    database: str
    model_loaded: bool

class ModelStatusResponse(BaseModel):
    is_trained: bool
    contamination: float
    features_count: int
    feature_names: List[str]
    last_trained_timestamp: Optional[str] = None

class PredictionRequest(BaseModel):
    employee_id: str
    department: Optional[str] = "Engineering"
    login_time: Optional[str] = "2026-07-24 22:00:00"
    session_duration_hours: Optional[float] = 8.0
    upload_mb: Optional[float] = 10.0
    download_mb: Optional[float] = 50.0
    usb_connected: Optional[bool] = False
    files_accessed: Optional[int] = 15
    sensitive_files_accessed: Optional[int] = 0
    primary_application: Optional[str] = "VS Code"

class ReportRequest(BaseModel):
    employee_id: str

class TrainResponse(BaseModel):
    status: str
    samples_trained: int
    features_used: List[str]
    anomalies_detected: int
    normals_detected: int
