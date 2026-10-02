import os
import joblib
import logging
import numpy as np
import pandas as pd
from typing import Tuple, Dict, Any, List
from sklearn.ensemble import IsolationForest
from app.config import settings

logger = logging.getLogger("shadowwatch.isolation_forest")

class IsolationForestModel:
    def __init__(self, contamination: float = settings.CONTAMINATION):
        self.contamination = contamination
        self.model = IsolationForest(
            contamination=self.contamination,
            n_estimators=settings.N_ESTIMATORS,
            random_state=settings.RANDOM_STATE,
            n_jobs=-1
        )
        self.feature_cols: List[str] = []
        self.is_trained = False

    def train(self, df_features: pd.DataFrame, feature_names: List[str]) -> Dict[str, Any]:
        """Trains Isolation Forest model on numerical feature matrix."""
        self.feature_cols = feature_names
        X = df_features[self.feature_cols].values
        
        logger.info(f"Training Isolation Forest model on matrix shape {X.shape}...")
        self.model.fit(X)
        self.is_trained = True

        # Calculate decision scores
        scores = self.model.decision_function(X) # lower score means more anomalous
        preds = self.model.predict(X) # -1 for anomaly, 1 for normal

        anomaly_count = int(np.sum(preds == -1))
        normal_count = int(np.sum(preds == 1))

        self.save_model()

        return {
            "status": "success",
            "samples_trained": len(X),
            "features_used": self.feature_cols,
            "anomalies_detected": anomaly_count,
            "normals_detected": normal_count,
            "contamination_rate": self.contamination
        }

    def predict(self, df_features: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        """Predicts anomaly decision scores and anomaly labels (-1 = Anomaly, 1 = Normal)."""
        if not self.is_trained:
            self.load_model()
            if not self.is_trained:
                raise ValueError("Isolation Forest model is not trained yet. Call train() first.")

        X = df_features[self.feature_cols].values
        decision_scores = self.model.decision_function(X)
        predictions = self.model.predict(X)
        return decision_scores, predictions

    def get_raw_anomaly_score(self, df_features: pd.DataFrame) -> np.ndarray:
        """Converts raw decision function into a 0.0 to 1.0 raw anomaly intensity score."""
        decision_scores, _ = self.predict(df_features)
        # Decision scores typically range from [-0.5, 0.5]. Lower is more anomalous.
        # Normalize into [0, 1] where 1.0 is extremely anomalous.
        raw_anomaly = 1.0 - (decision_scores - (-0.5)) / (0.5 - (-0.5))
        return np.clip(raw_anomaly, 0.0, 1.0)

    def save_model(self, file_path: str = None):
        if file_path is None:
            file_path = str(settings.MODEL_DIR / "isolation_forest.joblib")
        joblib.dump({"model": self.model, "feature_cols": self.feature_cols}, file_path)
        logger.info(f"Saved trained Isolation Forest model to {file_path}")

    def load_model(self, file_path: str = None):
        if file_path is None:
            file_path = str(settings.MODEL_DIR / "isolation_forest.joblib")
        if os.path.exists(file_path):
            data = joblib.load(file_path)
            self.model = data["model"]
            self.feature_cols = data["feature_cols"]
            self.is_trained = True
            logger.info(f"Successfully loaded Isolation Forest model from {file_path}")

isolation_model = IsolationForestModel()
