import React from 'react';
import { ShieldAlert, Activity, Database, Cpu, BookOpen, RefreshCw } from 'lucide-react';
import { HealthStatus } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  health: HealthStatus | null;
  onOpenResearchModal: () => void;
  onRefresh: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  health,
  onOpenResearchModal,
  onRefresh
}) => {
  const tabs = [
    { id: 'dashboard', label: 'SOC Dashboard', icon: Activity },
    { id: 'dna', label: 'Behavior DNA', icon: Cpu },
    { id: 'shap', label: 'Explainable AI (SHAP)', icon: ShieldAlert },
    { id: 'graph', label: 'Knowledge Graph', icon: Database },
    { id: 'pipeline', label: 'Dataset & Model Pipeline', icon: RefreshCw },
  ];

  return (
    <header className="border-b border-gray-800 bg-[#0B0F19]/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Platform Identifier */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-wider text-white">SHADOW<span className="text-cyan-400">WATCH</span></span>
                <span className="text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800/60 px-1.5 py-0.5 rounded">v2.5 UEBA</span>
              </div>
              <p className="text-xs text-slate-400 font-mono">AI Behavioral Threat Intelligence</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Status & Actions */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenResearchModal}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/60 text-indigo-300 border border-indigo-700/50 text-xs hover:bg-indigo-900/60 transition"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-mono">Future Research</span>
            </button>

            {/* Health Badge */}
            <div className="flex items-center space-x-2 bg-gray-900/80 border border-gray-800 px-3 py-1.5 rounded-lg text-xs">
              <span className={`w-2 h-2 rounded-full ${health?.status === 'healthy' ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`} />
              <span className="text-slate-300 font-mono text-[11px]">
                {health?.database.includes('MongoDB') ? 'MongoDB Live' : 'In-Memory DB'}
              </span>
            </div>

            <button
              onClick={onRefresh}
              className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-gray-800 rounded-lg transition"
              title="Refresh Pipeline Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
