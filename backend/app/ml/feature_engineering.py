import numpy as np
import pandas as pd
import math
from typing import Tuple, List, Dict
import logging

logger = logging.getLogger("shadowwatch.feature_engineering")

def compute_shannon_entropy(series: pd.Series) -> float:
    """Computes Shannon Information Entropy for categorical distributions (e.g. app/file access diversity)."""
    if series.empty:
        return 0.0
    counts = series.value_counts()
    probs = counts / len(series)
    entropy = -sum(p * math.log2(p) for p in probs if p > 0)
    return round(entropy, 4)

class FeatureEngineer:
    def __init__(self):
        self.feature_names: List[str] = []

    def transform(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, List[str]]:
        """Generates advanced behavioral, temporal, variance, and entropy features."""
        df_feat = df.copy()

        # 1. Temporal & Work Hours Features
        if 'login_dt' in df_feat.columns:
            df_feat['login_hour'] = df_feat['login_dt'].dt.hour
            df_feat['day_of_week'] = df_feat['login_dt'].dt.dayofweek
        elif 'login_time' in df_feat.columns:
            parsed_dt = pd.to_datetime(df_feat['login_time'], errors='coerce')
            df_feat['login_hour'] = parsed_dt.dt.hour.fillna(9).astype(int)
            df_feat['day_of_week'] = parsed_dt.dt.dayofweek.fillna(0).astype(int)
        else:
            df_feat['login_hour'] = 9
            df_feat['day_of_week'] = 0

        df_feat['weekend_login'] = df_feat['day_of_week'].apply(lambda d: 1 if d in [5, 6] else 0)
        df_feat['working_hour_flag'] = df_feat['login_hour'].apply(lambda h: 1 if 8 <= h <= 18 else 0)

        # 2. Session & Frequency Features
        if 'session_duration_hours' not in df_feat.columns:
            df_feat['session_duration_hours'] = 8.0
        
        # 3. USB Frequency & Device Activity
        if 'usb_connected' in df_feat.columns:
            df_feat['usb_connected_num'] = df_feat['usb_connected'].apply(lambda x: 1 if str(x).lower() in ['true', '1', 'yes'] else 0)
        else:
            df_feat['usb_connected_num'] = 0

        if 'usb_transfer_mb' not in df_feat.columns:
            df_feat['usb_transfer_mb'] = 0.0

        # 4. Upload & Download Throughput
        if 'upload_mb' not in df_feat.columns:
            df_feat['upload_mb'] = 10.0
        if 'download_mb' not in df_feat.columns:
            df_feat['download_mb'] = 50.0

        # 5. Application & File Access Count
        if 'application_count' not in df_feat.columns:
            df_feat['application_count'] = 4
        if 'files_accessed' not in df_feat.columns:
            df_feat['files_accessed'] = 15

        # 6. Behavioral Variances & Entropies (Grouped by Employee if multiple logs present)
        if 'employee_id' in df_feat.columns and len(df_feat) > 1:
            emp_stats = df_feat.groupby('employee_id').agg({
                'login_hour': ['var', 'mean'],
                'session_duration_hours': ['var', 'mean'],
                'primary_application': lambda s: compute_shannon_entropy(s),
                'files_accessed': ['mean', lambda s: compute_shannon_entropy(s)]
            })
            emp_stats.columns = ['login_variance', 'login_hour_mean', 'session_variance', 'session_duration_mean', 'app_entropy', 'avg_file_access', 'file_entropy']
            emp_stats = emp_stats.fillna(0.0).reset_index()

            # Merge back
            df_feat = df_feat.merge(emp_stats, on='employee_id', how='left')
        else:
            df_feat['login_variance'] = 0.5
            df_feat['session_variance'] = 0.8
            df_feat['app_entropy'] = 1.2
            df_feat['file_entropy'] = 1.8
            df_feat['avg_file_access'] = df_feat['files_accessed']

        # Ensure defaults for required features
        df_feat['usb_frequency'] = df_feat['usb_connected_num']
        df_feat['avg_upload_mb'] = df_feat['upload_mb']
        df_feat['avg_download_mb'] = df_feat['download_mb']

        # Feature vector columns for ML model
        self.feature_names = [
            'login_hour', 'day_of_week', 'weekend_login', 'working_hour_flag',
            'session_duration_hours', 'usb_frequency', 'usb_transfer_mb',
            'app_entropy', 'file_entropy', 'login_variance', 'session_variance',
            'avg_upload_mb', 'avg_download_mb', 'avg_file_access', 'application_count'
        ]

        # Ensure all columns exist and fill NaNs
        for col in self.feature_names:
            if col not in df_feat.columns:
                df_feat[col] = 0.0
            df_feat[col] = df_feat[col].fillna(0.0)

        return df_feat, self.feature_names

feature_engineer = FeatureEngineer()
