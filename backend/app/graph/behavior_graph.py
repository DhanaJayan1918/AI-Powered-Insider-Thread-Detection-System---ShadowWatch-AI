import networkx as nx
try:
    from pyvis.network import Network
    HAS_PYVIS = True
except ImportError:
    Network = None
    HAS_PYVIS = False
from typing import Dict, Any, List
import pandas as pd
import logging
import json

logger = logging.getLogger("shadowwatch.behavior_graph")

class BehavioralKnowledgeGraph:
    """Enterprise Behavioral Knowledge Graph Engine using NetworkX and PyVis."""
    def __init__(self):
        self.graph = nx.DiGraph()

    def build_graph_from_logs(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Builds directed multi-entity graph with 9 node types and 7 edge types."""
        self.graph.clear()
        
        # Color mapping for 9 Node Types
        node_colors = {
            "Employee": "#3B82F6", # blue
            "Department": "#8B5CF6", # purple
            "Manager": "#EC4899", # pink
            "Device": "#10B981", # emerald
            "Application": "#F59E0B", # amber
            "IP": "#06B6D4", # cyan
            "Website": "#14B8A6", # teal
            "USB": "#EF4444", # red
            "File": "#6366F1" # indigo
        }

        # Filter top high-risk users and representative baseline users for fast, responsive rendering
        risk_col = 'calculated_risk_score' if 'calculated_risk_score' in df.columns else 'behavioral_risk_score'
        df_top = df.sort_values(by=risk_col, ascending=False).drop_duplicates(subset=['employee_id']).head(35)

        # Process filtered log records to add Nodes & Edges
        for _, row in df_top.iterrows():
            emp_id = str(row.get('employee_id', 'EMP_UNK'))
            dept = str(row.get('department', 'Engineering'))
            mgr = str(row.get('manager_id', 'MGR_EXEC'))
            device = str(row.get('login_device', f"PC-{emp_id}"))
            app = str(row.get('primary_application', 'VS Code'))
            ip = str(row.get('login_ip', '192.168.1.50'))
            website = str(row.get('websites_visited', 'github.com')).split(';')[0] if 'websites_visited' in row and pd.notna(row['websites_visited']) else 'internal.corp'
            usb_id = str(row.get('usb_device_id', 'USB_SECURE_01')) if pd.notna(row.get('usb_device_id')) and str(row.get('usb_connected')).lower() in ['true', '1'] else 'NONE'
            risk_score = float(row.get('behavioral_risk_score', 15.0))

            # 1. Add Nodes
            self.graph.add_node(emp_id, label=emp_id, type="Employee", color=node_colors["Employee"], risk=risk_score, size=25)
            self.graph.add_node(f"DEPT_{dept}", label=dept, type="Department", color=node_colors["Department"], size=30)
            self.graph.add_node(mgr, label=mgr, type="Manager", color=node_colors["Manager"], size=25)
            self.graph.add_node(device, label=device, type="Device", color=node_colors["Device"], size=20)
            self.graph.add_node(f"APP_{app}", label=app, type="Application", color=node_colors["Application"], size=18)
            self.graph.add_node(ip, label=ip, type="IP", color=node_colors["IP"], size=18)
            self.graph.add_node(f"WEB_{website}", label=website, type="Website", color=node_colors["Website"], size=16)

            # 2. Add Edges (Hierarchical Flow)
            self.graph.add_edge(emp_id, f"DEPT_{dept}", relationship="ReportsTo", label="ReportsTo")
            self.graph.add_edge(mgr, f"DEPT_{dept}", relationship="ReportsTo", label="ReportsTo")
            self.graph.add_edge(emp_id, device, relationship="LogsInto", label="LogsInto")
            self.graph.add_edge(emp_id, f"APP_{app}", relationship="Uses", label="Uses")
            self.graph.add_edge(device, ip, relationship="CommunicatesWith", label="CommunicatesWith")
            self.graph.add_edge(ip, f"WEB_{website}", relationship="CommunicatesWith", label="CommunicatesWith")

            if usb_id != 'NONE':
                self.graph.add_node(usb_id, label=usb_id, type="USB", color=node_colors["USB"], size=22)
                self.graph.add_edge(device, usb_id, relationship="Uses", label="Uses")
                self.graph.add_edge(usb_id, f"FILE_CONFIDENTIAL_{emp_id}", relationship="Uploads", label="Uploads")
                self.graph.add_node(f"FILE_CONFIDENTIAL_{emp_id}", label="Sensitive_Dump.xlsx", type="File", color=node_colors["File"], size=20)
            else:
                file_id = f"FILE_DOC_{emp_id}"
                self.graph.add_node(file_id, label="Standard_Report.pdf", type="File", color=node_colors["File"], size=15)
                self.graph.add_edge(emp_id, file_id, relationship="Accesses", label="Accesses")

        return self.get_json_payload()

    def get_json_payload(self) -> Dict[str, Any]:
        """Formats NetworkX graph into clean JSON payload for React Vis.js frontend."""
        nodes = []
        for n, data in self.graph.nodes(data=True):
            nodes.append({
                "id": str(n),
                "label": str(data.get("label", n)),
                "type": data.get("type", "Unknown"),
                "color": data.get("color", "#94A3B8"),
                "risk": data.get("risk", 0.0),
                "size": data.get("size", 15)
            })

        edges = []
        for u, v, data in self.graph.edges(data=True):
            edges.append({
                "from": str(u),
                "to": str(v),
                "label": data.get("relationship", "Connects"),
                "color": "#475569"
            })

        return {
            "total_nodes": len(nodes),
            "total_edges": len(edges),
            "nodes": nodes,
            "edges": edges
        }

    def render_pyvis_html(self, output_file: str = "behavioral_knowledge_graph.html") -> str:
        """Renders interactive PyVis HTML file."""
        if not HAS_PYVIS or Network is None:
            logger.warning("PyVis library not installed. Skipping HTML export.")
            return ""
        net = Network(height="600px", width="100%", bgcolor="#0F172A", font_color="#F8FAFC", directed=True)
        net.from_nx(self.graph)
        net.save_graph(output_file)
        return output_file

knowledge_graph = BehavioralKnowledgeGraph()
