import React, { useEffect, useRef, useState } from 'react';
import { Database, Share2, Layers, Filter, RefreshCw } from 'lucide-react';
import { Network } from 'vis-network';
import { api } from '../services/api';
import { KnowledgeGraphData } from '../types';

export const KnowledgeGraphView: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [graphData, setGraphData] = useState<KnowledgeGraphData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);

  useEffect(() => {
    fetchGraph();
  }, []);

  const fetchGraph = async () => {
    setLoading(true);
    try {
      const res = await api.getKnowledgeGraph();
      setGraphData(res);
    } catch (err) {
      console.error("Error fetching Knowledge Graph:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (graphData && containerRef.current) {
      const data = {
        nodes: graphData.nodes.map(n => ({
          id: n.id,
          label: n.label,
          color: { background: n.color, border: '#1E293B', highlight: '#00F0FF' },
          font: { color: '#F8FAFC', face: 'Fira Code', size: 12 },
          shape: n.type === 'Employee' ? 'diamond' : 'dot',
          size: n.size || 18
        })),
        edges: graphData.edges.map(e => ({
          from: e.from,
          to: e.to,
          label: e.label,
          font: { color: '#94A3B8', size: 10, face: 'Fira Code' },
          color: { color: '#334155', highlight: '#00F0FF' },
          arrows: 'to'
        }))
      };

      const options = {
        physics: {
          enabled: true,
          solver: 'forceAtlas2Based',
          forceAtlas2Based: {
            gravitationalConstant: -35,
            centralGravity: 0.01,
            springLength: 85,
            springConstant: 0.08
          },
          stabilization: {
            enabled: true,
            iterations: 100,
            updateInterval: 20
          }
        },
        interaction: { hover: true, tooltipDelay: 150, zoomView: true, dragNodes: true }
      };

      const network = new Network(containerRef.current, data, options);

      network.on("selectNode", (params) => {
        if (params.nodes.length > 0) {
          const nodeId = params.nodes[0];
          const nodeObj = graphData.nodes.find(n => n.id === nodeId);
          setSelectedNode(nodeObj || { id: nodeId, label: nodeId, type: 'Entity' });
        }
      });
    }
  }, [graphData]);

  const legend = [
    { type: 'Employee', color: '#3B82F6' },
    { type: 'Department', color: '#8B5CF6' },
    { type: 'Manager', color: '#EC4899' },
    { type: 'Device', color: '#10B981' },
    { type: 'Application', color: '#F59E0B' },
    { type: 'IP', color: '#06B6D4' },
    { type: 'Website', color: '#14B8A6' },
    { type: 'USB', color: '#EF4444' },
    { type: 'File', color: '#6366F1' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="cyber-card p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400 border border-cyan-500/20">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-wide">Behavioral Knowledge Graph Engine</h2>
            <p className="text-xs text-slate-400 font-mono">9 Entity Node Types &bull; 7 Relationship Edge Types</p>
          </div>
        </div>

        <button
          onClick={fetchGraph}
          className="flex items-center space-x-2 bg-gray-900 hover:bg-gray-800 text-slate-300 border border-gray-800 px-3.5 py-1.5 rounded-lg text-xs font-mono transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Rebuild Graph</span>
        </button>
      </div>

      {/* Main Canvas & Legend Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Network Canvas */}
        <div className="lg:col-span-3 cyber-card rounded-2xl overflow-hidden relative border border-gray-800" style={{ height: '600px' }}>
          {loading && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
              <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          <div ref={containerRef} className="w-full h-full bg-[#090D16]" />
        </div>

        {/* Sidebar Legend & Entity Inspector */}
        <div className="space-y-6">
          
          <div className="cyber-card p-5 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center">
              <Layers className="w-4 h-4 mr-2 text-cyan-400" /> 9 Entity Node Types
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              {legend.map(item => (
                <div key={item.type} className="flex items-center space-x-2 bg-gray-900/60 p-2 rounded border border-gray-800">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-300">{item.type}</span>
                </div>
              ))}
            </div>
          </div>

          {selectedNode && (
            <div className="cyber-card p-5 rounded-2xl space-y-3 border-l-4 border-l-cyan-500">
              <h4 className="text-xs font-bold text-cyan-400 font-mono uppercase tracking-wider">
                Inspected Node
              </h4>
              <div className="space-y-1.5 text-xs font-mono text-slate-300">
                <div>ID: <span className="text-white font-bold">{selectedNode.id}</span></div>
                <div>Type: <span className="text-cyan-400 font-bold">{selectedNode.type}</span></div>
                {selectedNode.risk !== undefined && (
                  <div>Risk: <span className="text-red-400 font-bold">{selectedNode.risk}/100</span></div>
                )}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
