import os
import logging
from typing import Dict, Any, Tuple, Optional
import pandas as pd
from pathlib import Path
from app.config import settings

logger = logging.getLogger("shadowwatch.data_loader")

REQUIRED_SYNTHETIC_COLUMNS = [
    'date', 'employee_id', 'department', 'designation', 'manager_id', 
    'login_time', 'logout_time', 'session_duration_hours', 'login_device', 
    'login_ip', 'vpn_used', 'failed_login_attempts', 'primary_application', 
    'application_count', 'files_accessed', 'sensitive_files_accessed', 
    'usb_connected', 'usb_transfer_mb', 'upload_mb', 'download_mb'
]

class DataLoader:
    def __init__(self, dataset_dir: Path = settings.DATASET_DIR):
        self.dataset_dir = dataset_dir

    def load_synthetic_dataset(self) -> pd.DataFrame:
        v2_path = self.dataset_dir / "Synthetic" / "ShadowWatch_Synthetic_Enterprise_Dataset_V2.xlsx"
        v1_path = self.dataset_dir / "Synthetic" / "ShadowWatch_Synthetic_Enterprise_Dataset.xlsx"
        
        if v2_path.exists():
            logger.info(f"Loading Synthetic V2 dataset from {v2_path}")
            df = pd.read_excel(v2_path)
        elif v1_path.exists():
            logger.info(f"Loading Synthetic V1 dataset from {v1_path}")
            df = pd.read_excel(v1_path)
        else:
            raise FileNotFoundError("No Synthetic dataset Excel file found in datasets/Synthetic.")
        
        return df

    def load_cert_benchmark(self) -> Dict[str, pd.DataFrame]:
        cert_dir = self.dataset_dir / "CERT"
        results = {}
        
        for name in ['logon.csv', 'device.csv', 'http.csv']:
            file_path = cert_dir / name
            if file_path.exists():
                logger.info(f"Loading CERT benchmark file: {name}")
                # Load sample for performance validation
                results[name.split('.')[0]] = pd.read_csv(file_path, nrows=50000)
        
        return results

    def validate_and_profile_upload(self, df: pd.DataFrame, file_name: str) -> Dict[str, Any]:
        """5-Stage Dataset Validation Pipeline: Upload -> Schema Validation -> Column Validation -> Data Profiling -> Preview -> Store"""
        # Stage 1: Upload Check
        stage1_upload = {
            "status": "passed",
            "file_name": file_name,
            "total_rows": len(df),
            "total_cols": len(df.columns)
        }
        
        # Stage 2: Schema Validation
        missing_cols = [col for col in REQUIRED_SYNTHETIC_COLUMNS if col not in df.columns]
        stage2_schema = {
            "status": "passed" if len(missing_cols) == 0 else "warning",
            "missing_required_columns": missing_cols,
            "detected_columns": list(df.columns)
        }
        
        # Stage 3: Column Type Validation
        col_types = {col: str(dtype) for col, dtype in df.dtypes.items()}
        stage3_columns = {
            "status": "passed",
            "column_types": col_types,
            "null_counts": df.isnull().sum().to_dict()
        }
        
        # Stage 4: Data Profiling
        numeric_df = df.select_dtypes(include=['number'])
        profile_stats = {}
        if not numeric_df.empty:
            desc = numeric_df.describe().T
            profile_stats = desc[['mean', 'std', 'min', 'max']].to_dict(orient='index')
            
        stage4_profiling = {
            "status": "passed",
            "unique_employees": int(df['employee_id'].nunique()) if 'employee_id' in df.columns else 0,
            "unique_departments": int(df['department'].nunique()) if 'department' in df.columns else 0,
            "numeric_stats": profile_stats
        }
        
        # Stage 5: Preview & Store
        preview_records = df.head(10).fillna('').to_dict(orient='records')
        stage5_preview = {
            "status": "passed",
            "preview_samples": preview_records
        }
        
        return {
            "upload_stage": stage1_upload,
            "schema_stage": stage2_schema,
            "column_stage": stage3_columns,
            "profiling_stage": stage4_profiling,
            "preview_stage": stage5_preview,
            "overall_status": "SUCCESS" if len(missing_cols) == 0 else "PARTIAL_SCHEMA_MATCH"
        }

data_loader = DataLoader()
