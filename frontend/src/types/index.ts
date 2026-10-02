export interface HealthStatus {
  status: string;
  version: string;
  database: string;
  model_loaded: boolean;
}

export interface ModelStatus {
  is_trained: boolean;
  contamination: number;
  features_count: number;
  feature_names: string[];
  last_trained_timestamp?: str;
}

export interface HighRiskUser {
  employee_id: string;
  department: string;
  designation: string;
  behavioral_risk_score: number;
  anomaly_type: string;
  login_ip: string;
  upload_mb: number;
  usb_connected: boolean;
}

export interface DashboardSummary {
  total_employees: number;
  active_employees: number;
  high_risk_users_count: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  risk_distribution: Array<{ category: string; count: number; color: string }>;
  threat_types: Record<string, number>;
  high_risk_users_feed: HighRiskUser[];
  organization_memory: Record<string, any>;
}

export interface BehaviorDNA {
  employee_id: string;
  department: string;
  login_pattern: { mean_login_hour: number; login_variance: number; weekend_login_ratio: number; off_hours_ratio: number };
  session_pattern: { mean_session_duration: number; session_variance: number; max_session_hours: number };
  application_pattern: { primary_apps: string[]; app_entropy: number; avg_app_count: number };
  usb_pattern: { usb_frequency: number; avg_usb_transfer_mb: number; last_usb_device: string };
  network_pattern: { avg_upload_mb: number; avg_download_mb: number; vpn_usage_ratio: number };
  file_pattern: { avg_files_accessed: number; sensitive_file_access_rate: number; file_entropy: number };
}

export interface EmployeeProfile {
  employee_id: string;
  department: string;
  designation: string;
  manager_id: string;
  device_id: string;
  ip_address: string;
  behavior_dna: BehaviorDNA;
}

export interface ShapDriver {
  feature_name: string;
  feature_value: number;
  shap_value: number;
  impact: string;
}

export interface ShapExplanationResponse {
  employee_id: string;
  event_risk_score?: number;
  anomaly_type?: string;
  shap_explanation: {
    explainer_type: string;
    top_contributing_features: ShapDriver[];
    all_features: ShapDriver[];
  };
}

export interface KnowledgeGraphData {
  total_nodes: number;
  total_edges: number;
  nodes: Array<{ id: string; label: string; type: string; color: string; risk?: number; size?: number }>;
  edges: Array<{ from: string; to: string; label: string; color: string }>;
}

export interface IncidentTimelineItem {
  time: string;
  event: string;
}

export interface MitreAttackItem {
  technique_id: string;
  technique_name: string;
  description: string;
}

export interface CopilotReport {
  copilot_engine: string;
  executive_summary: string;
  incident_timeline: IncidentTimelineItem[];
  root_cause: string;
  mitre_attack_mapping: MitreAttackItem[];
  recommended_actions: string[];
  investigation_report: string;
}
