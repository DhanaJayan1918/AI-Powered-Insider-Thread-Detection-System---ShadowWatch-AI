import axios from 'axios';
import {
  HealthStatus,
  ModelStatus,
  DashboardSummary,
  EmployeeProfile,
  ShapExplanationResponse,
  KnowledgeGraphData,
  CopilotReport
} from '../types';

const API_BASE = '/api/v1';

export const api = {
  getHealth: async (): Promise<HealthStatus> => {
    const res = await axios.get(`${API_BASE}/health`);
    return res.data;
  },

  getModelStatus: async (): Promise<ModelStatus> => {
    const res = await axios.get(`${API_BASE}/model/status`);
    return res.data;
  },

  getDashboardSummary: async (): Promise<DashboardSummary> => {
    const res = await axios.get(`${API_BASE}/dashboard`);
    return res.data;
  },

  getAllEmployees: async (): Promise<{ count: number; employees: Array<{ employee_id: string; department: string; designation: string; behavioral_risk_score: number }> }> => {
    const res = await axios.get(`${API_BASE}/employees`);
    return res.data;
  },

  getEmployeeDna: async (employeeId: string): Promise<EmployeeProfile> => {
    const res = await axios.get(`${API_BASE}/employees/${employeeId}/dna`);
    return res.data;
  },

  getShapExplanation: async (employeeId: string): Promise<ShapExplanationResponse> => {
    const res = await axios.get(`${API_BASE}/explain/${employeeId}`);
    return res.data;
  },

  getKnowledgeGraph: async (): Promise<KnowledgeGraphData> => {
    const res = await axios.get(`${API_BASE}/graph`);
    return res.data;
  },

  generateCopilotReport: async (employeeId: string): Promise<CopilotReport> => {
    const res = await axios.post(`${API_BASE}/report`, { employee_id: employeeId });
    return res.data;
  },

  trainModel: async () => {
    const res = await axios.post(`${API_BASE}/train`);
    return res.data;
  },

  uploadDataset: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await axios.post(`${API_BASE}/upload_dataset`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  }
};
