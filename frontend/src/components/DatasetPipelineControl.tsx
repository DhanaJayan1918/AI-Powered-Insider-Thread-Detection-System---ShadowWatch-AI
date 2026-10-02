import React, { useState, useEffect } from 'react';
import { Upload, RefreshCw, CheckCircle, AlertCircle, FileSpreadsheet, Server, Database } from 'lucide-react';
import { api } from '../services/api';
import { ModelStatus } from '../types';

export const DatasetPipelineControl: React.FC = () => {
  const [status, setStatus] = useState<ModelStatus | null>(null);
  const [uploadResult, setUploadResult] = useState<any | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [training, setTraining] = useState<boolean>(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await api.getModelStatus();
      setStatus(res);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploading(true);
    try {
      const res = await api.uploadDataset(file);
      setUploadResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleRetrain = async () => {
    setTraining(true);
    try {
      await api.trainModel();
      await fetchStatus();
    } catch (err) {
      console.error(err);
    } finally {
      setTraining(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="cyber-card p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400 border border-cyan-500/20">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-wide">Dataset & Model Pipeline Control</h2>
            <p className="text-xs text-slate-400 font-mono">5-Stage Upload Validation &bull; Isolation Forest Retraining</p>
          </div>
        </div>

        <button
          onClick={handleRetrain}
          disabled={training}
          className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-black font-bold font-mono px-4 py-2 rounded-xl text-xs transition shadow-lg shadow-cyan-500/20 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${training ? 'animate-spin' : ''}`} />
          <span>{training ? 'Retraining Pipeline...' : 'Retrain Isolation Forest'}</span>
        </button>
      </div>

      {/* Model State Summary & Upload Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Model State */}
        <div className="cyber-card p-5 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center">
            <Database className="w-4 h-4 mr-2 text-cyan-400" /> Active Model State
          </h3>

          <div className="space-y-2 text-xs font-mono text-slate-300">
            <div className="flex justify-between border-b border-gray-800 pb-2">
              <span>Model Status</span>
              <span className="text-emerald-400 font-bold flex items-center">
                <CheckCircle className="w-3.5 h-3.5 mr-1" /> Trained & Operational
              </span>
            </div>
            <div className="flex justify-between border-b border-gray-800 pb-2">
              <span>Contamination Rate</span>
              <span className="text-white font-bold">{status?.contamination || 0.05}</span>
            </div>
            <div className="flex justify-between border-b border-gray-800 pb-2">
              <span>Active Features</span>
              <span className="text-cyan-400 font-bold">{status?.features_count || 15} Vectors</span>
            </div>
            <div className="flex justify-between">
              <span>Last Trained Timestamp</span>
              <span className="text-slate-400">{status?.last_trained_timestamp || 'Auto-Initialized'}</span>
            </div>
          </div>
        </div>

        {/* 5-Stage Dataset Upload Trigger */}
        <div className="cyber-card p-5 rounded-2xl space-y-4 border-dashed border-2 border-gray-800 hover:border-cyan-500/50 transition flex flex-col items-center justify-center text-center">
          <FileSpreadsheet className="w-10 h-10 text-cyan-400" />
          <div>
            <h4 className="font-bold text-white text-sm font-mono">Upload Custom Activity Dataset</h4>
            <p className="text-xs text-slate-400 font-mono mt-1">Supports Excel (.xlsx) or CSV format</p>
          </div>

          <label className="cursor-pointer bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono text-xs px-4 py-2 rounded-xl transition flex items-center space-x-2">
            <Upload className="w-4 h-4" />
            <span>Select Dataset File</span>
            <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

      </div>

      {/* 5-Stage Upload Validation Results */}
      {uploadResult && (
        <div className="cyber-card p-5 rounded-2xl space-y-4 border-l-4 border-l-cyan-500">
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center justify-between">
            <span>5-Stage Upload Validation Pipeline</span>
            <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded">
              {uploadResult.overall_status}
            </span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs font-mono">
            
            <div className="bg-gray-900 p-3 rounded-xl border border-gray-800">
              <span className="text-slate-500 block mb-1">Stage 1: Upload</span>
              <span className="text-emerald-400 font-bold">Passed</span>
              <span className="text-slate-400 block text-[10px] mt-1">{uploadResult.upload_stage.total_rows} rows</span>
            </div>

            <div className="bg-gray-900 p-3 rounded-xl border border-gray-800">
              <span className="text-slate-500 block mb-1">Stage 2: Schema</span>
              <span className="text-emerald-400 font-bold">{uploadResult.schema_stage.status}</span>
            </div>

            <div className="bg-gray-900 p-3 rounded-xl border border-gray-800">
              <span className="text-slate-500 block mb-1">Stage 3: Columns</span>
              <span className="text-emerald-400 font-bold">{uploadResult.column_stage.status}</span>
            </div>

            <div className="bg-gray-900 p-3 rounded-xl border border-gray-800">
              <span className="text-slate-500 block mb-1">Stage 4: Profiling</span>
              <span className="text-cyan-400 font-bold">{uploadResult.profiling_stage.unique_employees} Users</span>
            </div>

            <div className="bg-gray-900 p-3 rounded-xl border border-gray-800">
              <span className="text-slate-500 block mb-1">Stage 5: Preview</span>
              <span className="text-emerald-400 font-bold">Ready</span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
