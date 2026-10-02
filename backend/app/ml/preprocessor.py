import logging
import numpy as np
import pandas as pd
from typing import Tuple, Dict, List
from sklearn.preprocessing import StandardScaler, LabelEncoder

logger = logging.getLogger("shadowwatch.preprocessor")

class DataPreprocessor:
    def __init__(self):
        self.scaler = StandardScaler()
        self.label_encoders: Dict[str, LabelEncoder] = {}

    def fit_transform_df(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, List[str]]:
        """Preprocesses raw synthetic/enterprise log DataFrame into standardized numerical features."""
        df_clean = df.copy()

        # Handle missing values
        numeric_cols = df_clean.select_dtypes(include=[np.number]).columns
        for col in numeric_cols:
            df_clean[col] = df_clean[col].fillna(df_clean[col].median() if len(df_clean[col].dropna()) > 0 else 0)
            
        categorical_cols = df_clean.select_dtypes(include=['object', 'category']).columns
        for col in categorical_cols:
            df_clean[col] = df_clean[col].fillna('UNKNOWN')

        # Datetime processing
        if 'login_time' in df_clean.columns:
            df_clean['login_dt'] = pd.to_datetime(df_clean['login_time'], errors='coerce')
        elif 'date' in df_clean.columns:
            df_clean['login_dt'] = pd.to_datetime(df_clean['date'], errors='coerce')
        else:
            df_clean['login_dt'] = pd.Timestamp.now()

        # Categorical label encoding
        cat_to_encode = ['department', 'designation', 'work_location', 'primary_application', 'browser_used']
        for col in cat_to_encode:
            if col in df_clean.columns:
                le = LabelEncoder()
                df_clean[f'{col}_encoded'] = le.fit_transform(df_clean[col].astype(str))
                self.label_encoders[col] = le

        # Handle boolean flags
        bool_cols = ['vpn_used', 'powershell_used', 'usb_connected', 'confidential_access', 'external_cloud_used']
        for col in bool_cols:
            if col in df_clean.columns:
                df_clean[f'{col}_num'] = df_clean[col].apply(lambda x: 1 if str(x).lower() in ['true', '1', 'yes'] else 0)

        return df_clean, list(self.label_encoders.keys())

preprocessor = DataPreprocessor()
