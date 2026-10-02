import pytest
import pandas as pd
from fastapi.testclient import TestClient
from app.main import app
from app.ml.data_loader import data_loader
from app.ml.feature_engineering import feature_engineer
from app.ml.profile_engine import profile_engine
from app.ml.isolation_forest import isolation_model
from app.ml.risk_engine import risk_engine
from app.graph.behavior_graph import knowledge_graph

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data

def test_model_status_endpoint():
    response = client.get("/api/v1/model/status")
    assert response.status_code == 200
    data = response.json()
    assert "is_trained" in data
    assert "features_count" in data

def test_synthetic_data_loader():
    df = data_loader.load_synthetic_dataset()
    assert isinstance(df, pd.DataFrame)
    assert len(df) > 0
    assert 'employee_id' in df.columns

def test_feature_engineering_and_risk_engine():
    df_raw = data_loader.load_synthetic_dataset()
    df_feat, feature_names = feature_engineer.transform(df_raw)
    assert len(feature_names) > 0
    
    # Risk calculation test
    res = risk_engine.calculate_risk_score(
        raw_isolation_score=0.8,
        behavior_trend_velocity=0.5,
        dna_distance=0.7,
        department_deviation=0.4,
        historical_baseline_risk=30.0
    )
    assert 0 <= res["behavioral_risk_score"] <= 100
    assert res["risk_category"] in ["CRITICAL", "HIGH", "MEDIUM", "LOW"]

def test_behavioral_knowledge_graph():
    df_raw = data_loader.load_synthetic_dataset().head(20)
    df_feat, _ = feature_engineer.transform(df_raw)
    payload = knowledge_graph.build_graph_from_logs(df_feat)
    assert payload["total_nodes"] > 0
    assert payload["total_edges"] > 0

def test_dashboard_endpoint():
    response = client.get("/api/v1/dashboard")
    assert response.status_code == 200
    data = response.json()
    assert "total_employees" in data
    assert "risk_distribution" in data
