import logging
from typing import Dict, Any, List, Optional
import numpy as np
import pandas as pd

logger = logging.getLogger("shadowwatch.profile_engine")

class BehavioralProfileEngine:
    def __init__(self):
        self.employee_profiles: Dict[str, Dict[str, Any]] = {}
        self.department_profiles: Dict[str, Dict[str, Any]] = {}
        self.organization_memory: Dict[str, Any] = {}

    def build_baselines(self, df: pd.DataFrame):
        """Builds multi-level Organization Memory baselines across Employee, Department, and Org levels."""
        logger.info("Computing multi-level organizational baselines...")

        # 1. Organization-level Memory Baseline
        self.organization_memory = {
            "avg_login_hour": float(df['login_hour'].mean()) if 'login_hour' in df.columns else 9.0,
            "avg_session_duration": float(df['session_duration_hours'].mean()) if 'session_duration_hours' in df.columns else 8.0,
            "avg_upload_mb": float(df['upload_mb'].mean()) if 'upload_mb' in df.columns else 15.0,
            "avg_download_mb": float(df['download_mb'].mean()) if 'download_mb' in df.columns else 60.0,
            "usb_connection_rate": float(df['usb_connected_num'].mean()) if 'usb_connected_num' in df.columns else 0.1,
            "total_employees": int(df['employee_id'].nunique()) if 'employee_id' in df.columns else len(df)
        }

        # 2. Department-level Baselines
        if 'department' in df.columns:
            dept_grouped = df.groupby('department')
            for dept_name, group in dept_grouped:
                self.department_profiles[str(dept_name)] = {
                    "department": str(dept_name),
                    "employee_count": int(group['employee_id'].nunique()) if 'employee_id' in group.columns else len(group),
                    "avg_session_hours": float(group['session_duration_hours'].mean()) if 'session_duration_hours' in group.columns else 8.0,
                    "avg_upload_mb": float(group['upload_mb'].mean()) if 'upload_mb' in group.columns else 15.0,
                    "avg_download_mb": float(group['download_mb'].mean()) if 'download_mb' in group.columns else 60.0,
                    "primary_applications": group['primary_application'].value_counts().head(3).index.tolist() if 'primary_application' in group.columns else [],
                    "avg_risk_score": float(group['behavioral_risk_score'].mean()) if 'behavioral_risk_score' in group.columns else 15.0
                }

        # 3. Employee 6D Behavior DNA Profiles
        if 'employee_id' in df.columns:
            emp_grouped = df.groupby('employee_id')
            for emp_id, group in emp_grouped:
                emp_id_str = str(emp_id)
                dept = str(group['department'].iloc[0]) if 'department' in group.columns else 'General'
                manager = str(group['manager_id'].iloc[0]) if 'manager_id' in group.columns else 'MGR_EXEC'
                designation = str(group['designation'].iloc[0]) if 'designation' in group.columns else 'Engineer'
                device = str(group['login_device'].iloc[0]) if 'login_device' in group.columns else f"PC-{emp_id_str}"
                ip = str(group['login_ip'].iloc[0]) if 'login_ip' in group.columns else "192.168.1.100"

                dna = self.extract_behavior_dna(group, emp_id_str, dept)
                self.employee_profiles[emp_id_str] = {
                    "employee_id": emp_id_str,
                    "department": dept,
                    "designation": designation,
                    "manager_id": manager,
                    "device_id": device,
                    "ip_address": ip,
                    "behavior_dna": dna,
                    "sample_count": len(group)
                }

    def extract_behavior_dna(self, group: pd.DataFrame, emp_id: str, dept: str) -> Dict[str, Any]:
        """Extracts structured 6D Behavior DNA profile."""
        login_hrs = group['login_hour'].tolist() if 'login_hour' in group.columns else [9]
        sessions = group['session_duration_hours'].tolist() if 'session_duration_hours' in group.columns else [8]
        apps = group['primary_application'].dropna().unique().tolist() if 'primary_application' in group.columns else ['VS Code']
        
        # 1. Login Pattern
        login_pattern = {
            "mean_login_hour": round(float(np.mean(login_hrs)), 2),
            "login_variance": round(float(np.var(login_hrs)), 2),
            "weekend_login_ratio": round(float(group['weekend_login'].mean()), 2) if 'weekend_login' in group.columns else 0.0,
            "off_hours_ratio": round(float((1 - group['working_hour_flag']).mean()), 2) if 'working_hour_flag' in group.columns else 0.1
        }

        # 2. Session Pattern
        session_pattern = {
            "mean_session_duration": round(float(np.mean(sessions)), 2),
            "session_variance": round(float(np.var(sessions)), 2),
            "max_session_hours": round(float(np.max(sessions)), 2)
        }

        # 3. Application Pattern
        app_pattern = {
            "primary_apps": apps[:5],
            "app_entropy": round(float(group['app_entropy'].mean()), 2) if 'app_entropy' in group.columns else 1.2,
            "avg_app_count": round(float(group['application_count'].mean()), 2) if 'application_count' in group.columns else 4.0
        }

        # 4. USB Pattern
        usb_pattern = {
            "usb_frequency": round(float(group['usb_connected_num'].mean()), 2) if 'usb_connected_num' in group.columns else 0.0,
            "avg_usb_transfer_mb": round(float(group['usb_transfer_mb'].mean()), 2) if 'usb_transfer_mb' in group.columns else 0.0,
            "last_usb_device": str(group['usb_device_id'].iloc[-1]) if 'usb_device_id' in group.columns and not group['usb_device_id'].isna().all() else 'None'
        }

        # 5. Network Pattern
        network_pattern = {
            "avg_upload_mb": round(float(group['upload_mb'].mean()), 2) if 'upload_mb' in group.columns else 10.0,
            "avg_download_mb": round(float(group['download_mb'].mean()), 2) if 'download_mb' in group.columns else 50.0,
            "vpn_usage_ratio": round(float(group['vpn_used'].apply(lambda x: 1 if str(x).lower() in ['true','1'] else 0).mean()), 2) if 'vpn_used' in group.columns else 0.5
        }

        # 6. File Pattern
        file_pattern = {
            "avg_files_accessed": round(float(group['files_accessed'].mean()), 2) if 'files_accessed' in group.columns else 15.0,
            "sensitive_file_access_rate": round(float(group['sensitive_files_accessed'].mean()), 2) if 'sensitive_files_accessed' in group.columns else 0.0,
            "file_entropy": round(float(group['file_entropy'].mean()), 2) if 'file_entropy' in group.columns else 1.5
        }

        return {
            "employee_id": emp_id,
            "department": dept,
            "login_pattern": login_pattern,
            "session_pattern": session_pattern,
            "application_pattern": app_pattern,
            "usb_pattern": usb_pattern,
            "network_pattern": network_pattern,
            "file_pattern": file_pattern
        }

    def update_adaptive_profile(self, emp_id: str, new_log: Dict[str, Any], alpha: float = 0.2):
        """Adaptive Behavioral Profile update using Exponential Moving Averages (EMA) without full retraining."""
        if emp_id not in self.employee_profiles:
            return

        dna = self.employee_profiles[emp_id]["behavior_dna"]
        
        # Update login pattern EMA
        new_hour = new_log.get('login_hour', 9)
        old_mean_hour = dna['login_pattern']['mean_login_hour']
        dna['login_pattern']['mean_login_hour'] = round((1 - alpha) * old_mean_hour + alpha * new_hour, 2)

        # Update network pattern EMA
        new_up = new_log.get('upload_mb', 10.0)
        old_up = dna['network_pattern']['avg_upload_mb']
        dna['network_pattern']['avg_upload_mb'] = round((1 - alpha) * old_up + alpha * new_up, 2)

        self.employee_profiles[emp_id]["behavior_dna"] = dna
        logger.info("Adaptive EMA profile updated for employee %s", emp_id)

profile_engine = BehavioralProfileEngine()
