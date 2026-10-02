# Future Research & Academic Roadmap

ShadowWatch AI provides a foundation for advanced cybersecurity threat intelligence research. This document outlines research directions for academic reviewers, faculty evaluators, and enterprise software architects.

---

## 1. Graph Neural Networks (GNNs) & Temporal Graph Networks (TGNs)

### Current Implementation
- NetworkX-based static multi-entity graph construction.
- PyVis standalone HTML renderer and Vis.js frontend JSON generator.

### Proposed Research Horizon
- **Dynamic Node Embeddings**: Replace traditional heuristic distance algorithms with GraphSAGE or Relational Graph Convolutional Networks (RGCNs) to learn continuous vector embeddings for multi-modal entity types (`Employee`, `Department`, `Device`, `USB`, `IP`, `File`).
- **Temporal Edge Memory**: Integrate Temporal Graph Networks (TGNs) with continuous-time memory modules to model edge creation events (e.g. `LogsInto`, `Accesses`, `Uploads`) as a continuous stochastic process.

---

## 2. Deep Sequential Anomaly Detection (LSTM Autoencoders)

### Current Implementation
- Isolation Forest unsupervised anomaly detection with SHAP explainability.

### Proposed Research Horizon
- **Reconstruction Loss Metric**: Deploy LSTM Autoencoders or Transformer-based Log Encoders to process sequential audit logs.
- **APT Sequence Detection**: Detect multi-stage Advanced Persistent Threats (APTs) where individual events appear normal in isolation but represent suspicious kill-chain progression over 14-day rolling windows.

---

## 3. Federated Learning for Multi-Tenant UEBA

### Current Implementation
- Centralized baseline profiling and Organization Memory engine.

### Proposed Research Horizon
- **Privacy-Preserving Collaborative Training**: Implement Federated Learning (e.g. FedAvg / FedProx) across geographically distributed corporate branches or multi-tenant SOC environments.
- **Differential Privacy**: Enforce $(\epsilon, \delta)$-differential privacy guarantees on local gradient updates to ensure employee log data remains strictly localized on-premises.

---

## 4. Real-time Streaming Architecture (Apache Kafka & Flink)

### Current Implementation
- FastAPI REST endpoints with async background task processing.

### Proposed Research Horizon
- **Stream Processing**: Integrate Apache Kafka topics for event ingestion paired with Apache Flink stateful Complex Event Processing (CEP).
- **Sub-Second Threat Scoring**: Compute rolling feature aggregations (sliding window entropy, throughput variances) in under 100 milliseconds.

---

## 5. Enterprise SIEM & Graph Database Migration

### Current Implementation
- In-memory NetworkX graph store + MongoDB JSON collection.

### Proposed Research Horizon
- **Neo4j Backend Migration**: Store entity topologies natively in Neo4j, enabling Cypher graph queries (e.g. shortest path between compromised USB device and sensitive database server).
- **SIEM Connectors**: Bi-directional integration with Splunk SOAR, Microsoft Sentinel, and CrowdStrike Falcon APIs for automated playbook triggers.
