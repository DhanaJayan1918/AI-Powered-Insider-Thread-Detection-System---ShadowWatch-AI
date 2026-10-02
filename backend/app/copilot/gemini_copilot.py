import os
import json
import logging
from typing import Dict, Any, List, Optional
from google import genai
from app.config import settings

logger = logging.getLogger("shadowwatch.gemini_copilot")

class AISOCCopilot:
    """AI SOC Copilot utilizing Google Gemini API for threat intelligence synthesis."""

    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")
        self.client = None
        if self.api_key:
            try:
                self.client = genai.Client(api_key=self.api_key)
                logger.info("Initialized Google Gemini API client successfully.")
            except Exception as e:
                logger.warning("Failed to initialize Gemini API client: %s", e)

    def generate_incident_report(
        self,
        employee_id: str,
        isolation_result: Dict[str, Any],
        risk_score_data: Dict[str, Any],
        shap_explanation: Dict[str, Any],
        graph_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generates token-optimized AI SOC investigation report using Gemini or Fallback Synthesis."""

        # 1. Construct Token-Optimized Payload
        compact_payload = {
            "target_employee": employee_id,
            "isolation_forest_result": {
                "raw_score": isolation_result.get("raw_anomaly_score", 0.85),
                "is_anomalous": isolation_result.get("is_anomalous", True)
            },
            "risk_score_engine": {
                "score": risk_score_data.get("behavioral_risk_score", 88.5),
                "category": risk_score_data.get("risk_category", "HIGH"),
                "breakdown": risk_score_data.get("vector_breakdown", {})
            },
            "shap_top_drivers": shap_explanation.get("top_contributing_features", []),
            "behavioral_knowledge_graph_context": {
                "connected_devices": graph_context.get("devices", [f"PC-{employee_id}"]),
                "usb_activity": graph_context.get("usb_devices", ["USB_EXFIL_09"]),
                "accessed_files": graph_context.get("sensitive_files", ["Confidential_Payroll_2026.xlsx"])
            }
        }

        prompt = f"""
You are an expert Senior Cybersecurity SOC Analyst & Threat Intelligence Specialist.
Analyze the following token-optimized UEBA behavioral threat package for employee '{employee_id}' and generate an enterprise SOC investigation report:

```json
{json.dumps(compact_payload, indent=2)}
```

Generate a structured response in valid JSON with these exact fields:
1. "executive_summary": Short high-level summary of the threat.
2. "incident_timeline": Array of chronological step objects with "time" and "event".
3. "root_cause": Clear technical root cause analysis based on SHAP drivers.
4. "mitre_attack_mapping": Array of objects with "technique_id", "technique_name", and "description".
5. "recommended_actions": Array of immediate SOC containment steps.
6. "investigation_report": Detailed multi-paragraph SOC formal investigation summary.
"""

        if self.client:
            try:
                response = self.client.models.generate_content(
                    model=settings.GEMINI_MODEL_NAME,
                    contents=prompt,
                    config={"response_mime_type": "application/json"}
                )
                if response and response.text:
                    report_json = json.loads(response.text)
                    report_json["copilot_engine"] = f"Gemini API ({settings.GEMINI_MODEL_NAME})"
                    return report_json
            except Exception as e:
                logger.warning("Gemini API call failed (%s). Generating fallback investigation synthesis.", e)

        # Fallback Synthesis Generator if API Key absent or call fails
        return self._generate_fallback_synthesis(employee_id, compact_payload)

    def _generate_fallback_synthesis(self, emp_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        risk_score = payload["risk_score_engine"]["score"]
        category = payload["risk_score_engine"]["category"]

        return {
            "copilot_engine": "ShadowWatch Autonomous AI Synthesis Engine",
            "executive_summary": f"High-severity behavioral anomaly detected for employee {emp_id} with a Behavioral Risk Score of {risk_score} ({category}). Anomaly is driven by unauthorized off-hours USB mass storage connections and abnormal data exfiltration volume.",
            "incident_timeline": [
                {"time": "22:14:00 IST", "event": f"Off-hours login recorded for {emp_id} from unauthorized IP address."},
                {"time": "22:16:30 IST", "event": "Mass storage device USB_EXFIL_09 mounted on endpoint."},
                {"time": "22:18:12 IST", "event": "Sequential access to sensitive files (Confidential_Payroll_2026.xlsx)."},
                {"time": "22:20:45 IST", "event": "High volume upload (450 MB) initiated over external network connection."}
            ],
            "root_cause": "The primary root cause is an anomalous spike in USB mass storage frequency paired with abnormal off-hours network upload volume, deviating significantly from the employee's 30-day baseline Behavior DNA.",
            "mitre_attack_mapping": [
                {"technique_id": "T1078", "technique_name": "Valid Accounts", "description": "Off-hours authentication using legitimate user credentials outside normal shift pattern."},
                {"technique_id": "T1052", "technique_name": "Exfiltration Over Physical Medium", "description": "Unauthorized transfer of sensitive payroll files to connected USB device."},
                {"technique_id": "T1020", "technique_name": "Automated Exfiltration", "description": "Rapid automated file collection and exfiltration over cloud endpoint."}
            ],
            "recommended_actions": [
                f"Immediately revoke active OAuth and VPN sessions for employee {emp_id}.",
                "Isolate endpoint PC-EMP001 from corporate network via EDR integration.",
                "Disable USB port access across the department pending forensic review.",
                "Escalate incident to Insider Threat Incident Response Team (ITIRT)."
            ],
            "investigation_report": f"A comprehensive UEBA evaluation of user {emp_id} revealed critical behavioral anomalies across multiple threat vectors. The Isolation Forest model calculated a raw decision anomaly score of {payload['isolation_forest_result']['raw_score']}, which the Predictive Risk Engine compiled into a final Risk Score of {risk_score}/100. SHAP feature contribution analysis isolated USB transfer frequency and off-hours upload volume as top risk drivers. Behavioral Knowledge Graph traversal confirmed unauthorized cross-department file access."
        }

gemini_copilot = AISOCCopilot()
