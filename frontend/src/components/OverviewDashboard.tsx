import React from 'react';
import { Users, ShieldAlert, AlertTriangle, Activity, Bot, ChevronRight, HardDrive, ArrowUpRight } from 'lucide-react';
import { DashboardSummary, HighRiskUser } from '../types';

interface OverviewDashboardProps {
  summary: DashboardSummary | null;
  onSelectUserForCopilot: (empId: string) => void;
  onSelectUserForDna: (empId: string) => void;
  onSelectUserForShap: (empId: string) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  summary,
  onSelectUserForCopilot,
  onSelectUserForDna,
  onSelectUserForShap
}) => {
  if (!summary) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 font-mono text-sm">Loading UEBA Threat Intelligence Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="cyber-card p-5 rounded-2xl border-l-4 border-l-cyan-500 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-mono">Total Employees</p>
            <h3 className="text-2xl font-black text-white mt-1 font-mono">{summary.total_employees}</h3>
            <p className="text-[11px] text-emerald-400 mt-1 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block mr-1"></span>
              {summary.active_employees} Active Profiling
            </p>
          </div>
          <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400 border border-cyan-500/20">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="cyber-card p-5 rounded-2xl border-l-4 border-l-red-500 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-mono">High Risk Users</p>
            <h3 className="text-2xl font-black text-red-400 mt-1 font-mono">{summary.high_risk_users_count}</h3>
            <p className="text-[11px] text-red-400/80 mt-1">Requires SOC Attention</p>
          </div>
          <div className="p-3 bg-red-500/10 rounded-xl text-red-400 border border-red-500/20">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        <div className="cyber-card p-5 rounded-2xl border-l-4 border-l-amber-500 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-mono">Critical Anomalies</p>
            <h3 className="text-2xl font-black text-amber-400 mt-1 font-mono">{summary.critical_count}</h3>
            <p className="text-[11px] text-amber-400/80 mt-1">Risk Score &gt; 90/100</p>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="cyber-card p-5 rounded-2xl border-l-4 border-l-indigo-500 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-mono">Organization Memory</p>
            <h3 className="text-2xl font-black text-indigo-400 mt-1 font-mono">Active</h3>
            <p className="text-[11px] text-indigo-300 mt-1">Multi-level Adaptive Baselines</p>
          </div>
          <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
            <Activity className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Main Grid: Threat Feed & Risk Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: High Risk Threat Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white tracking-wide">Real-time Behavioral Threat Feed</h2>
            </div>
            <span className="text-xs font-mono bg-cyan-950 text-cyan-400 border border-cyan-800 px-2.5 py-1 rounded-full">
              Live Monitoring
            </span>
          </div>

          <div className="space-y-3">
            {summary.high_risk_users_feed.map((user: HighRiskUser) => {
              const isCritical = user.behavioral_risk_score >= 90;
              const isHigh = user.behavioral_risk_score >= 70 && user.behavioral_risk_score < 90;

              return (
                <div
                  key={user.employee_id}
                  className="cyber-card p-4 rounded-xl hover:border-cyan-500/40 transition group relative overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    
                    {/* User & Threat Details */}
                    <div className="flex items-start space-x-3">
                      <div className={`w-11 h-11 rounded-lg flex items-center justify-center font-bold font-mono text-sm shrink-0 border ${
                        isCritical
                          ? 'bg-red-500/10 text-red-400 border-red-500/30'
                          : isHigh
                          ? 'bg-orange-500/10 text-orange-400 border-orange-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}>
                        {user.employee_id.substring(0, 6)}
                      </div>

                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-white text-base group-hover:text-cyan-400 transition">{user.employee_id}</h4>
                          <span className="text-xs text-slate-400">({user.department})</span>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                            isCritical ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-orange-950 text-orange-400 border border-orange-800'
                          }`}>
                            {user.anomaly_type}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mt-1 font-mono">
                          <span>IP: {user.login_ip}</span>
                          <span>Upload: {user.upload_mb} MB</span>
                          {user.usb_connected && (
                            <span className="text-red-400 flex items-center font-semibold">
                              <HardDrive className="w-3 h-3 mr-1" /> USB Connected
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Risk Score & Actions */}
                    <div className="flex items-center justify-between sm:justify-end space-x-4">
                      
                      <div className="text-right">
                        <div className="text-xs text-slate-400 font-mono">Risk Score</div>
                        <div className={`text-xl font-black font-mono ${
                          isCritical ? 'text-red-400' : isHigh ? 'text-orange-400' : 'text-amber-400'
                        }`}>
                          {user.behavioral_risk_score} <span className="text-xs text-slate-500">/ 100</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onSelectUserForCopilot(user.employee_id)}
                          className="flex items-center space-x-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 px-3 py-1.5 rounded-lg text-xs font-mono transition"
                          title="Generate AI SOC Copilot Report"
                        >
                          <Bot className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Copilot</span>
                        </button>

                        <button
                          onClick={() => onSelectUserForShap(user.employee_id)}
                          className="p-1.5 bg-gray-800 hover:bg-gray-700 text-slate-300 rounded-lg text-xs transition"
                          title="Explain SHAP Drivers"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </button>
                      </div>

                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Risk Distribution & Threat Category Breakdown */}
        <div className="space-y-6">
          
          <div className="cyber-card p-5 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center justify-between">
              <span>Risk Severity Distribution</span>
              <Activity className="w-4 h-4 text-cyan-400" />
            </h3>

            <div className="space-y-3">
              {summary.risk_distribution.map((item) => (
                <div key={item.category} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-300">{item.category} Risk</span>
                    <span className="font-bold" style={{ color: item.color }}>{item.count} Employees</span>
                  </div>
                  <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, (item.count / summary.total_employees) * 100)}%`,
                        backgroundColor: item.color
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="cyber-card p-5 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              Detected Behavioral Vectors
            </h3>

            <div className="space-y-2.5">
              {Object.entries(summary.threat_types || {}).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between bg-gray-900/60 p-2.5 rounded-lg border border-gray-800/80 text-xs">
                  <span className="text-slate-300 font-medium">{type}</span>
                  <span className="font-mono bg-cyan-950 text-cyan-400 border border-cyan-800/50 px-2 py-0.5 rounded font-bold">
                    {count} events
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
