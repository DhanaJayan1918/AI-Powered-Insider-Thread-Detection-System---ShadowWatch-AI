import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { OverviewDashboard } from './components/OverviewDashboard';
import { BehaviorDnaView } from './components/BehaviorDnaView';
import { ShapExplainabilityView } from './components/ShapExplainabilityView';
import { KnowledgeGraphView } from './components/KnowledgeGraphView';
import { DatasetPipelineControl } from './components/DatasetPipelineControl';
import { AiCopilotDrawer } from './components/AiCopilotDrawer';
import { FutureResearchModal } from './components/FutureResearchModal';
import { api } from './services/api';
import { HealthStatus, DashboardSummary } from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  
  // Selected Employee State for Deep-Dives & Copilot
  const [copilotEmployeeId, setCopilotEmployeeId] = useState<string | null>(null);
  const [selectedDnaUser, setSelectedDnaUser] = useState<string>('EMP001');
  const [selectedShapUser, setSelectedShapUser] = useState<string>('EMP001');
  const [isResearchModalOpen, setIsResearchModalOpen] = useState<boolean>(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const healthRes = await api.getHealth();
      setHealth(healthRes);

      const summaryRes = await api.getDashboardSummary();
      setSummary(summaryRes);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    }
  };

  const handleSelectUserForCopilot = (empId: string) => {
    setCopilotEmployeeId(empId);
  };

  const handleSelectUserForDna = (empId: string) => {
    setSelectedDnaUser(empId);
    setActiveTab('dna');
  };

  const handleSelectUserForShap = (empId: string) => {
    setSelectedShapUser(empId);
    setActiveTab('shap');
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col font-sans">
      
      {/* Header Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        health={health}
        onOpenResearchModal={() => setIsResearchModalOpen(true)}
        onRefresh={loadData}
      />

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <OverviewDashboard
            summary={summary}
            onSelectUserForCopilot={handleSelectUserForCopilot}
            onSelectUserForDna={handleSelectUserForDna}
            onSelectUserForShap={handleSelectUserForShap}
          />
        )}

        {activeTab === 'dna' && (
          <BehaviorDnaView initialEmployeeId={selectedDnaUser} />
        )}

        {activeTab === 'shap' && (
          <ShapExplainabilityView initialEmployeeId={selectedShapUser} />
        )}

        {activeTab === 'graph' && (
          <KnowledgeGraphView />
        )}

        {activeTab === 'pipeline' && (
          <DatasetPipelineControl />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-[#0B0F19] py-6 text-center text-xs text-slate-500 font-mono">
        <p>ShadowWatch AI Enterprise UEBA Threat Intelligence Platform &bull; Production v2.5</p>
      </footer>

      {/* AI SOC Copilot Drawer */}
      <AiCopilotDrawer
        employeeId={copilotEmployeeId}
        onClose={() => setCopilotEmployeeId(null)}
      />

      {/* Future Research Modal */}
      <FutureResearchModal
        isOpen={isResearchModalOpen}
        onClose={() => setIsResearchModalOpen(false)}
      />

    </div>
  );
};

export default App;
