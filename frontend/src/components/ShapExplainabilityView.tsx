import React, { useState, useEffect } from 'react';
import { ShieldAlert, BarChart3, HelpCircle, ArrowUpRight, CheckCircle2, AlertTriangle, UserCheck } from 'lucide-react';
import { api } from '../services/api';
import { ShapExplanationResponse, ShapDriver } from '../types';

interface ShapExplainabilityViewProps {
  initialEmployeeId?: string;
}

export const ShapExplainabilityView: React.FC<ShapExplainabilityViewProps> = ({ initialEmployeeId = 'EMP001' }) => {
  const [employeeId, setEmployeeId] = useState<string>(initialEmployeeId);
  const [allEmployees, setAllEmployees] = useState<Array<{ employee_id: string; department: string; designation: string; behavioral_risk_score: number }>>([]);
  const [shapData, setShapData] = useState<ShapExplanationResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    loadEmployeeList();
  }, []);

  useEffect(() => {
    if (initialEmployeeId) {
      setEmployeeId(initialEmployeeId);
    }
  }, [initialEmployeeId]);

  useEffect(() => {
    fetchShap(employeeId);
  }, [employeeId]);

  const loadEmployeeList = async () => {
    try {
      const res = await api.getAllEmployees();
      setAllEmployees(res.employees || []);
    } catch (err) {
      console.error("Error loading employees:", err);
    }
  };

  const fetchShap = async (id: string) => {
    setLoading(true);
    try {
      const res = await api.getShapExplanation(id);
      setShapData(res);
    } catch (err) {
      console.error("Error fetching SHAP explanation:", err);
    } finally {
      setLoading(false);
    }
  };

  const selectedEmpObj = allEmployees.find(e => e.employee_id === employeeId);
  const currentRisk = shapData?.event_risk_score ?? selectedEmpObj?.behavioral_risk_score ?? 85;
  const isAnomalous = currentRisk >= 70;

  return (
    <div className="space-y-6">
      
      {/* Header & Dropdown Employee Switcher */}
      <div className="cyber-card p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400 border border-cyan-500/20">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-wide">Explainable AI (SHAP Explainer)</h2>
            <p className="text-xs text-slate-400 font-mono">TreeExplainer / KernelExplainer Feature Attribution & Insights</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-xs font-mono text-slate-400 hidden sm:inline">Target Employee:</span>
          <select
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-cyan-400 font-bold font-mono focus:outline-none focus:border-cyan-500"
          >
            {allEmployees.map((emp) => (
              <option key={emp.employee_id} value={emp.employee_id}>
                {emp.employee_id} - {emp.department} (Risk: {emp.behavioral_risk_score})
              </option>
            ))}
            {allEmployees.length === 0 && (
              <option value={employeeId}>{employeeId}</option>
            )}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : shapData ? (
        <div className="space-y-6">
          
          {/* Verdict Banner: Why Flagged as Abnormal or Normal */}
          <div className={`p-5 rounded-2xl border flex items-start space-x-4 ${
            isAnomalous
              ? 'bg-red-950/30 border-red-500/40 text-red-200'
              : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
          }`}>
            <div className={`p-3 rounded-xl shrink-0 ${
              isAnomalous ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              {isAnomalous ? <AlertTriangle className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
            </div>

            <div className="space-y-1">
              <div className="flex items-center space-x-3">
                <h3 className="font-mono font-bold text-base text-white">
                  Model Decision Verdict: {isAnomalous ? '🚨 ANOMALOUS BEHAVIOR DETECTED' : '✅ NORMAL BEHAVIORAL PATTERN'}
                </h3>
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                  isAnomalous ? 'bg-red-900 text-red-300' : 'bg-emerald-900 text-emerald-300'
                }`}>
                  Risk Score: {currentRisk} / 100
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-mono">
                {isAnomalous
                  ? `Isolation Forest flagged employee ${employeeId} due to critical baseline deviations: unauthorized mass USB storage connections, abnormal off-hours network upload throughput, and high file path entropy.`
                  : `Employee ${employeeId} operates strictly within standard organizational baseline parameters. Login times, device connectivity, and data transfer volumes conform to department averages.`}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Top Contributing Features List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="cyber-card p-5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white font-mono flex items-center">
                    <BarChart3 className="w-4 h-4 mr-2 text-cyan-400" />
                    Feature Contribution Breakdown for {shapData.employee_id}
                  </h3>
                  <span className="text-xs font-mono text-cyan-400 bg-cyan-950 px-2.5 py-1 rounded border border-cyan-800">
                    {shapData.shap_explanation.explainer_type}
                  </span>
                </div>

                <div className="space-y-3">
                  {shapData.shap_explanation.top_contributing_features.map((driver: ShapDriver, idx: number) => {
                    const isAnomalyIncr = driver.impact.includes("Anomaly");
                    const barWidth = Math.min(100, Math.abs(driver.shap_value) * 250);

                    return (
                      <div key={idx} className="bg-gray-900/90 p-4 rounded-xl border border-gray-800 space-y-2">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-white text-sm">{driver.feature_name}</span>
                            <span className="text-slate-400 bg-black/50 px-2 py-0.5 rounded">Recorded Log Value: <strong className="text-cyan-300">{driver.feature_value}</strong></span>
                          </div>
                          <span className={`font-bold px-2.5 py-1 rounded text-xs ${
                            isAnomalyIncr ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          }`}>
                            {isAnomalyIncr ? '🚨 Anomaly Driver' : '✅ Normalizing Factor'} ({driver.shap_value > 0 ? `+${driver.shap_value.toFixed(3)}` : driver.shap_value.toFixed(3)})
                          </span>
                        </div>

                        {/* SHAP Impact Bar */}
                        <div className="w-full h-2.5 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isAnomalyIncr ? 'bg-gradient-to-r from-red-600 to-red-400' : 'bg-gradient-to-r from-emerald-600 to-emerald-400'
                            }`}
                            style={{ width: `${Math.max(12, barWidth)}%` }}
                          />
                        </div>

                        <p className="text-[11px] text-slate-400 font-mono pt-1">
                          {isAnomalyIncr
                            ? `• Anomaly Reasoning: Recorded '${driver.feature_name}' value (${driver.feature_value}) deviates significantly from standard employee behavior DNA, increasing anomaly decision score.`
                            : `• Normalization Reasoning: Recorded '${driver.feature_name}' value (${driver.feature_value}) aligns with expected department baselines.`}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Explainer Guidance & Model Attribution */}
            <div className="space-y-4">
              <div className="cyber-card p-5 rounded-2xl space-y-3">
                <h4 className="text-sm font-bold text-white font-mono flex items-center">
                  <HelpCircle className="w-4 h-4 mr-2 text-indigo-400" />
                  How SHAP Insights Work
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed font-mono">
                  SHAP (SHapley Additive exPlanations) breaks down complex Isolation Forest decisions into human-interpretable feature attribution values.
                </p>
                <div className="space-y-3 pt-2 border-t border-gray-800 text-xs font-mono text-slate-300">
                  <div className="bg-red-950/30 p-2.5 rounded-lg border border-red-900/50">
                    <span className="text-red-400 font-bold block">Negative SHAP Score (&lt; 0)</span>
                    <span className="text-slate-300 text-[11px]">Drives isolation tree partition depth lower, accelerating the user's anomaly classification.</span>
                  </div>
                  <div className="bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-900/50">
                    <span className="text-emerald-400 font-bold block">Positive SHAP Score (&gt; 0)</span>
                    <span className="text-slate-300 text-[11px]">Reinforces standard organizational memory baseline behavior.</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      ) : null}

    </div>
  );
};
