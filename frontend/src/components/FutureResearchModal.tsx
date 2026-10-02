import React from 'react';
import { X, BookOpen, GitBranch, Cpu, Network, Radio, Database } from 'lucide-react';

interface FutureResearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FutureResearchModal: React.FC<FutureResearchModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const researchTopics = [
    {
      title: 'Graph Neural Networks (GNNs) & Temporal Graph Networks (TGNs)',
      icon: Network,
      color: 'text-cyan-400',
      description: 'Migrating NetworkX baselines to dynamic GNN embeddings (GraphSAGE / TGN) for continuous node representation learning across dynamic enterprise topology.'
    },
    {
      title: 'LSTM Autoencoders & Transformer Log Encoders',
      icon: Cpu,
      color: 'text-indigo-400',
      description: 'Combining unsupervised Isolation Forest with deep sequential reconstruction loss (LSTM Autoencoders) to detect multi-stage APT killchain progression.'
    },
    {
      title: 'Federated Learning for Privacy-Preserving UEBA',
      icon: GitBranch,
      color: 'text-purple-400',
      description: 'Enabling multi-organization collaborative threat model training without sharing sensitive employee activity logs, preserving zero-trust privacy compliance.'
    },
    {
      title: 'Apache Kafka & Flink Streaming Engine',
      icon: Radio,
      color: 'text-amber-400',
      description: 'Scaling to million-events-per-second streaming throughput with distributed stateful CEP (Complex Event Processing) and micro-batched feature generation.'
    },
    {
      title: 'Enterprise SIEM & Neo4j Backend Integration',
      icon: Database,
      color: 'text-emerald-400',
      description: 'Native bidirectional connector for Splunk SOAR, Microsoft Sentinel, CrowdStrike Falcon API, and Cypher-powered Neo4j graph traversal.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0B0F19] border border-gray-800 rounded-2xl max-w-3xl w-full p-6 space-y-6 shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-lg font-mono">Future Research & Enterprise Roadmap</h3>
              <p className="text-xs text-slate-400 font-mono">Academic & Faculty Review Architecture Specifications</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-gray-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Topics List */}
        <div className="space-y-4">
          {researchTopics.map((topic, idx) => {
            const Icon = topic.icon;
            return (
              <div key={idx} className="bg-gray-900/80 p-4 rounded-xl border border-gray-800/80 flex items-start space-x-4">
                <div className={`p-2.5 bg-gray-800 rounded-xl ${topic.color} shrink-0 mt-0.5`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className={`font-bold text-sm font-mono ${topic.color}`}>{topic.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{topic.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-gray-800 flex justify-end">
          <button
            onClick={onClose}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold px-5 py-2 rounded-xl transition"
          >
            Close Roadmap
          </button>
        </div>

      </div>
    </div>
  );
};
