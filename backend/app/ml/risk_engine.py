import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple
import logging

logger = logging.getLogger("shadowwatch.risk_engine")

class PredictiveRiskEngine:
    """Computes realistic 5-factor Behavioral Risk Score (0-100)."""

    def calculate_risk_score(
        self,
        raw_isolation_score: float, # 0.0 to 1.0 (1.0 = highly anomalous)
        behavior_trend_velocity: float, # -1.0 to 1.0 (positive = accelerating risk)
        dna_distance: float, # 0.0 to 1.0 Euclidean distance from baseline
        department_deviation: float, # 0.0 to 1.0 deviation from dept norm
        historical_baseline_risk: float # 0 to 100 past risk score
    ) -> Dict[str, Any]:
        """Calculates 0-100 Behavioral Risk Score using weighted multi-vector aggregation."""
        w_iso = 0.40   # Isolation Forest weight
        w_hist = 0.35  # Ground-truth dataset behavioral baseline risk weight
        w_dna = 0.15   # Behavior DNA distance weight
        w_trend = 0.05 # Trend velocity weight
        w_dept = 0.05  # Department deviation weight

        iso_part = raw_isolation_score * 100.0
        dna_part = dna_distance * 100.0
        dept_part = department_deviation * 100.0
        trend_part = max(0.0, behavior_trend_velocity) * 100.0
        hist_part = historical_baseline_risk

        final_risk = (
            w_iso * iso_part +
            w_hist * hist_part +
            w_dna * dna_part +
            w_trend * trend_part +
            w_dept * dept_part
        )

        # If historical baseline dataset score is an explicit high risk (>70), preserve threat severity
        if historical_baseline_risk >= 70.0:
            final_risk = max(final_risk, historical_baseline_risk)

        final_risk = float(np.clip(final_risk, 0.0, 100.0))

        # Determine Risk Level Category
        if final_risk >= 90.0:
            category = "CRITICAL"
            color = "#EF4444" # red
        elif final_risk >= 70.0:
            category = "HIGH"
            color = "#F97316" # orange
        elif final_risk >= 40.0:
            category = "MEDIUM"
            color = "#EAB308" # yellow
        else:
            category = "LOW"
            color = "#22C55E" # green

        return {
            "behavioral_risk_score": round(final_risk, 1),
            "risk_category": category,
            "badge_color": color,
            "vector_breakdown": {
                "isolation_score_contrib": round(w_iso * iso_part, 1),
                "dna_distance_contrib": round(w_dna * dna_part, 1),
                "department_deviation_contrib": round(w_dept * dept_part, 1),
                "trend_velocity_contrib": round(w_trend * trend_part, 1),
                "historical_baseline_contrib": round(w_hist * hist_part, 1)
            }
        }

risk_engine = PredictiveRiskEngine()
