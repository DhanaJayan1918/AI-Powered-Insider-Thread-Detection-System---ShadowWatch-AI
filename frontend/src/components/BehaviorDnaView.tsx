import React, { useState, useEffect } from 'react';
import { Cpu, Clock, HardDrive, Wifi, FileText, LayoutGrid, Search, UserCheck, AlertCircle, ArrowUpRight } from 'lucide-react';
import { api } from '../services/api';
import { EmployeeProfile } from '../types';

interface BehaviorDnaViewProps {
  initialEmployeeId?: string;
}

export const BehaviorDnaView: React.FC<BehaviorDnaViewProps> = ({ initialEmployeeId = 'EMP001' }) => {
  const [employeeId, setEmployeeId] = useState<string>(initialEmployeeId);
  const [allEmployees, setAllEmployees] = useState<Array<{ employee_id: string; department: string; designation: string; behavioral_risk_score: number }>>([]);
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
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
    fetchProfile(employeeId);
  }, [employeeId]);

  const loadEmployeeList = async () => {
    try {
      const res = await api.getAllEmployees();
      setAllEmployees(res.employees || []);
    } catch (err) {
      console.error("Error loading employee list:", err);
    }
  };

  const fetchProfile = async (id: string) => {
    setLoading(true);
    try {
      const res = await api.getEmployeeDna(id);
      setProfile(res);
    } catch (err) {
      console.error("Error fetching Behavior DNA:", err);
    } finally {
      setLoading(false);
    }
  };

  const dna = profile?.behavior_dna;

  return (
    <div className="space-y-6">
      
      {/* Header & Dropdown Employee Switcher */}
      <div className="cyber-card p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400 border border-cyan-500/20">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-wide">Behavior DNA Profile Engine</h2>
            <p className="text-xs text-slate-400 font-mono">6-Dimensional Multi-Vector Baseline Fingerprint</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-xs font-mono text-slate-400 hidden sm:inline">Select Subject:</span>
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
      ) : profile && dna ? (
        <div className="space-y-6">
          
          {/* Employee Identity Summary Bar */}
          <div className="bg-gray-900/80 border border-gray-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
            <div className="flex items-center space-x-3">
              <UserCheck className="w-5 h-5 text-cyan-400" />
              <div>
                <span className="text-white font-bold text-base">{profile.employee_id}</span>
                <span className="text-slate-400 ml-2">({profile.designation})</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-slate-300">
              <div>Department: <span className="text-cyan-400">{profile.department}</span></div>
              <div>Manager: <span className="text-slate-400">{profile.manager_id}</span></div>
              <div>Endpoint: <span className="text-slate-400">{profile.device_id}</span></div>
              <div>IP: <span className="text-slate-400">{profile.ip_address}</span></div>
            </div>
          </div>

          {/* Behavioral Baseline vs Current Anomaly Insight Card */}
          <div className="cyber-card p-5 rounded-2xl border-l-4 border-l-cyan-500 space-y-3">
            <h4 className="text-xs font-bold text-cyan-400 font-mono uppercase tracking-wider flex items-center">
              <ArrowUpRight className="w-4 h-4 mr-1.5" /> Behavioral Deviation Insights (Baseline vs Current Activity)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
              <div className="bg-gray-900/70 p-3 rounded-xl border border-gray-800">
                <span className="text-slate-400 block text-[11px]">Login Hour Deviation</span>
                <span className="text-white font-bold text-sm">{dna.login_pattern.mean_login_hour}:00 IST</span>
                <span className="text-amber-400 block text-[10px] mt-1">
                  {dna.login_pattern.off_hours_ratio > 0.2 ? '⚠️ Off-Hours Login Spike' : '✓ Normal Shift Pattern'}
                </span>
              </div>

              <div className="bg-gray-900/70 p-3 rounded-xl border border-gray-800">
                <span className="text-slate-400 block text-[11px]">Network Upload Vol</span>
                <span className="text-white font-bold text-sm">{dna.network_pattern.avg_upload_mb} MB</span>
                <span className="text-emerald-400 block text-[10px] mt-1">
                  {dna.network_pattern.avg_upload_mb > 100 ? '⚠️ High Outbound Transfer' : '✓ Standard Baseline'}
                </span>
              </div>

              <div className="bg-gray-900/70 p-3 rounded-xl border border-gray-800">
                <span className="text-slate-400 block text-[11px]">USB Connection Rate</span>
                <span className="text-white font-bold text-sm">{(dna.usb_pattern.usb_frequency * 100).toFixed(0)}%</span>
                <span className="text-red-400 block text-[10px] mt-1">
                  {dna.usb_pattern.usb_frequency > 0.3 ? '🚨 High USB Transfer Activity' : '✓ Low Device Usage'}
                </span>
              </div>

              <div className="bg-gray-900/70 p-3 rounded-xl border border-gray-800">
                <span className="text-slate-400 block text-[11px]">File Access Rate</span>
                <span className="text-white font-bold text-sm">{dna.file_pattern.avg_files_accessed} files/day</span>
                <span className="text-purple-400 block text-[10px] mt-1">
                  Entropy Score: {dna.file_pattern.file_entropy}
                </span>
              </div>
            </div>
          </div>

          {/* 6D Behavior DNA Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* 1. Login Pattern */}
            <div className="cyber-card p-5 rounded-xl space-y-3 border-t-2 border-t-cyan-500">
              <div className="flex items-center justify-between text-cyan-400">
                <h4 className="font-bold text-sm font-mono flex items-center">
                  <Clock className="w-4 h-4 mr-2" /> Login Pattern
                </h4>
                <span className="text-[10px] bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">Vector 1</span>
              </div>
              <div className="space-y-2 text-xs font-mono text-slate-300">
                <div className="flex justify-between border-b border-gray-800 pb-1.5">
                  <span>Mean Login Time</span>
                  <span className="text-white font-bold">{dna.login_pattern.mean_login_hour}:00 IST</span>
                </div>
                <div className="flex justify-between border-b border-gray-800 pb-1.5">
                  <span>Login Variance</span>
                  <span className="text-white font-bold">{dna.login_pattern.login_variance} hrs</span>
                </div>
                <div className="flex justify-between border-b border-gray-800 pb-1.5">
                  <span>Weekend Frequency</span>
                  <span className="text-emerald-400 font-bold">{(dna.login_pattern.weekend_login_ratio * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Off-Hours Ratio</span>
                  <span className="text-amber-400 font-bold">{(dna.login_pattern.off_hours_ratio * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>

            {/* 2. Session Pattern */}
            <div className="cyber-card p-5 rounded-xl space-y-3 border-t-2 border-t-indigo-500">
              <div className="flex items-center justify-between text-indigo-400">
                <h4 className="font-bold text-sm font-mono flex items-center">
                  <LayoutGrid className="w-4 h-4 mr-2" /> Session Pattern
                </h4>
                <span className="text-[10px] bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">Vector 2</span>
              </div>
              <div className="space-y-2 text-xs font-mono text-slate-300">
                <div className="flex justify-between border-b border-gray-800 pb-1.5">
                  <span>Mean Duration</span>
                  <span className="text-white font-bold">{dna.session_pattern.mean_session_duration} hrs</span>
                </div>
                <div className="flex justify-between border-b border-gray-800 pb-1.5">
                  <span>Session Variance</span>
                  <span className="text-white font-bold">{dna.session_pattern.session_variance}</span>
                </div>
                <div className="flex justify-between">
                  <span>Max Peak Session</span>
                  <span className="text-indigo-300 font-bold">{dna.session_pattern.max_session_hours} hrs</span>
                </div>
              </div>
            </div>

            {/* 3. Application Pattern */}
            <div className="cyber-card p-5 rounded-xl space-y-3 border-t-2 border-t-purple-500">
              <div className="flex items-center justify-between text-purple-400">
                <h4 className="font-bold text-sm font-mono flex items-center">
                  <Cpu className="w-4 h-4 mr-2" /> Application Pattern
                </h4>
                <span className="text-[10px] bg-purple-950 px-2 py-0.5 rounded border border-purple-800">Vector 3</span>
              </div>
              <div className="space-y-2 text-xs font-mono text-slate-300">
                <div className="flex justify-between border-b border-gray-800 pb-1.5">
                  <span>App Shannon Entropy</span>
                  <span className="text-purple-300 font-bold">{dna.application_pattern.app_entropy}</span>
                </div>
                <div className="flex justify-between border-b border-gray-800 pb-1.5">
                  <span>Avg Tool Count</span>
                  <span className="text-white font-bold">{dna.application_pattern.avg_app_count} apps</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Primary Tools:</span>
                  <div className="flex flex-wrap gap-1">
                    {dna.application_pattern.primary_apps.map((app, i) => (
                      <span key={i} className="bg-gray-800 px-2 py-0.5 rounded text-[11px] text-purple-300 border border-gray-700">
                        {app}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 4. USB Pattern */}
            <div className="cyber-card p-5 rounded-xl space-y-3 border-t-2 border-t-red-500">
              <div className="flex items-center justify-between text-red-400">
                <h4 className="font-bold text-sm font-mono flex items-center">
                  <HardDrive className="w-4 h-4 mr-2" /> USB & Hardware Pattern
                </h4>
                <span className="text-[10px] bg-red-950 px-2 py-0.5 rounded border border-red-800">Vector 4</span>
              </div>
              <div className="space-y-2 text-xs font-mono text-slate-300">
                <div className="flex justify-between border-b border-gray-800 pb-1.5">
                  <span>USB Mount Frequency</span>
                  <span className="text-red-400 font-bold">{(dna.usb_pattern.usb_frequency * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between border-b border-gray-800 pb-1.5">
                  <span>Avg Transfer Vol</span>
                  <span className="text-white font-bold">{dna.usb_pattern.avg_usb_transfer_mb} MB</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Hardware ID</span>
                  <span className="text-slate-400 font-bold">{dna.usb_pattern.last_usb_device}</span>
                </div>
              </div>
            </div>

            {/* 5. Network Pattern */}
            <div className="cyber-card p-5 rounded-xl space-y-3 border-t-2 border-t-emerald-500">
              <div className="flex items-center justify-between text-emerald-400">
                <h4 className="font-bold text-sm font-mono flex items-center">
                  <Wifi className="w-4 h-4 mr-2" /> Network Throughput
                </h4>
                <span className="text-[10px] bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">Vector 5</span>
              </div>
              <div className="space-y-2 text-xs font-mono text-slate-300">
                <div className="flex justify-between border-b border-gray-800 pb-1.5">
                  <span>Avg Upload MB</span>
                  <span className="text-emerald-400 font-bold">{dna.network_pattern.avg_upload_mb} MB</span>
                </div>
                <div className="flex justify-between border-b border-gray-800 pb-1.5">
                  <span>Avg Download MB</span>
                  <span className="text-white font-bold">{dna.network_pattern.avg_download_mb} MB</span>
                </div>
                <div className="flex justify-between">
                  <span>VPN Connection Rate</span>
                  <span className="text-cyan-400 font-bold">{(dna.network_pattern.vpn_usage_ratio * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>

            {/* 6. File Pattern */}
            <div className="cyber-card p-5 rounded-xl space-y-3 border-t-2 border-t-amber-500">
              <div className="flex items-center justify-between text-amber-400">
                <h4 className="font-bold text-sm font-mono flex items-center">
                  <FileText className="w-4 h-4 mr-2" /> File Access & Entropy
                </h4>
                <span className="text-[10px] bg-amber-950 px-2 py-0.5 rounded border border-amber-800">Vector 6</span>
              </div>
              <div className="space-y-2 text-xs font-mono text-slate-300">
                <div className="flex justify-between border-b border-gray-800 pb-1.5">
                  <span>Avg Files Accessed</span>
                  <span className="text-white font-bold">{dna.file_pattern.avg_files_accessed} docs</span>
                </div>
                <div className="flex justify-between border-b border-gray-800 pb-1.5">
                  <span>Sensitive File Ratio</span>
                  <span className="text-amber-400 font-bold">{(dna.file_pattern.sensitive_file_access_rate * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Path Entropy Score</span>
                  <span className="text-amber-300 font-bold">{dna.file_pattern.file_entropy}</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      ) : null}

    </div>
  );
};
