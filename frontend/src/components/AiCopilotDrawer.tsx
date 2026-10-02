import React, { useEffect, useState } from 'react';
import { Bot, X, ShieldAlert, Clock, AlertTriangle, FileText, CheckSquare, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { CopilotReport } from '../types';

interface AiCopilotDrawerProps {
  employeeId: string | null;
  onClose: () => void;
}

export const AiCopilotDrawer: React.FC<AiCopilotDrawerProps> = ({ employeeId, onClose }) => {
  const [report, setReport] = useState<CopilotReport | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (employeeId) {
      fetchReport(employeeId);
    }
  }, [employeeId]);

  const fetchReport = async (id: string) => {
    setLoading(true);
    try {
      const res = await api.generateCopilotReport(id);
      setReport(res);
    } catch (err) {
      console.error("Error generating Copilot report:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!employeeId) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-2xl bg-[#0B0F19] border-l border-gray-800 h-full overflow-y-auto flex flex-col shadow-2xl">
        
        {/* Top Bar */}
        <div className="p-5 border-b border-gray-800 bg-[#0F172A] flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-tr from-cyan-500 to-indigo-600 rounded-xl text-white shadow-lg">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base font-mono">AI SOC Copilot Intelligence Report</h3>
              <p className="text-xs text-slate-400 font-mono">Target Subject: <span className="text-cyan-400 font-bold">{employeeId}</span></p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-gray-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
              <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-cyan-400 font-mono text-sm animate-pulse">
                Synthesizing Token-Optimized Gemini AI SOC Threat Briefing...
              </p>
            </div>
          ) : report ? (
            <div className="space-y-6 text-sm text-slate-200">
              
              {/* Engine Badge */}
              <div className="flex items-center justify-between bg-cyan-950/40 border border-cyan-800/60 p-3 rounded-xl">
                <div className="flex items-center space-x-2 text-xs font-mono text-cyan-300">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Engine: {report.copilot_engine}</span>
                </div>
                <span className="text-[10px] font-mono bg-cyan-500 text-black font-bold px-2 py-0.5 rounded">Token Optimized</span>
              </div>

              {/* Executive Summary */}
              <div className="cyber-card p-4 rounded-xl space-y-2 border-l-4 border-l-cyan-500">
                <h4 className="font-bold text-white font-mono text-xs uppercase tracking-wider flex items-center">
                  <ShieldAlert className="w-4 h-4 mr-2 text-cyan-400" /> Executive Summary
                </h4>
                <p className="text-slate-300 leading-relaxed text-xs">{report.executive_summary}</p>
              </div>

              {/* Incident Timeline */}
              <div className="space-y-3">
                <h4 className="font-bold text-white font-mono text-xs uppercase tracking-wider flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-indigo-400" /> Incident Timeline
                </h4>
                <div className="space-y-2">
                  {report.incident_timeline.map((item, idx) => (
                    <div key={idx} className="bg-gray-900/60 p-3 rounded-xl border border-gray-800/80 flex items-start space-x-3 text-xs font-mono">
                      <span className="text-cyan-400 shrink-0 font-bold">{item.time}</span>
                      <span className="text-slate-300">{item.event}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Root Cause */}
              <div className="cyber-card p-4 rounded-xl space-y-2 border-l-4 border-l-amber-500">
                <h4 className="font-bold text-amber-400 font-mono text-xs uppercase tracking-wider flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2" /> Technical Root Cause
                </h4>
                <p className="text-slate-300 text-xs leading-relaxed">{report.root_cause}</p>
              </div>

              {/* MITRE ATT&CK Mapping */}
              <div className="space-y-3">
                <h4 className="font-bold text-white font-mono text-xs uppercase tracking-wider flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-purple-400" /> MITRE ATT&CK Mapping
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {report.mitre_attack_mapping.map((mitre, idx) => (
                    <div key={idx} className="bg-gray-900 p-3 rounded-xl border border-purple-900/40 text-xs space-y-1">
                      <div className="flex items-center justify-between font-mono">
                        <span className="text-purple-300 font-bold">{mitre.technique_id}: {mitre.technique_name}</span>
                      </div>
                      <p className="text-slate-400">{mitre.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Actions */}
              <div className="space-y-3">
                <h4 className="font-bold text-white font-mono text-xs uppercase tracking-wider flex items-center">
                  <CheckSquare className="w-4 h-4 mr-2 text-emerald-400" /> Recommended Containment Actions
                </h4>
                <div className="space-y-2">
                  {report.recommended_actions.map((act, idx) => (
                    <div key={idx} className="bg-emerald-950/20 border border-emerald-800/40 p-3 rounded-xl text-xs font-mono text-emerald-300 flex items-start space-x-2">
                      <span className="font-bold text-emerald-400">{idx + 1}.</span>
                      <span>{act}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Full Formal Report */}
              <div className="cyber-card p-4 rounded-xl space-y-2">
                <h4 className="font-bold text-white font-mono text-xs uppercase tracking-wider">
                  Formal Investigation Summary
                </h4>
                <p className="text-slate-400 text-xs leading-relaxed font-mono whitespace-pre-line">
                  {report.investigation_report}
                </p>
              </div>

            </div>
          ) : null}
        </div>

      </div>
    </div>
  );
};
