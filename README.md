# Aura-Core: Autonomous Multi-Model AI Orchestration Engine

Aura-Core is an enterprise-level autonomous system designed for high-availability technical content generation. The engine implements a sophisticated failover architecture, managing multiple Large Language Models (LLMs) to ensure system resilience and continuous operation without manual intervention.

---

## Technical Architecture and Operational Workflow

The system is architected as a serverless automation pipeline, utilizing GitHub Actions for task scheduling and Node.js for core logic execution. The primary focus is on system reliability through a dual-layer AI integration strategy.

### 1. Execution Pipeline

1. Trigger Mechanism: A GitHub Actions CRON job initiates the process daily at a predefined interval (00:00 UTC).
2. Orchestration Logic: The Node.js environment evaluates the availability of the primary inference node.
3. Primary Inference (Groq): Utilizes the Llama-3.3-70B model via Groq Cloud for low-latency, high-reasoning response generation.
4. Fallback Strategy (Hugging Face): Automatically redirects the request to secondary models if the primary API experiences latency or downtime.
5. Data Persistence: Generates a structured Markdown audit log (posts_log.md) and synchronizes updates with the version control system.

---

## System Capabilities

1. Self-Healing Design: Automated error handling that transitions between AI providers to eliminate single points of failure.
2. Secured Credential Management: Implementation of GitHub Repository Secrets for encrypted storage of API keys and tokens.
3. Stateless Execution Infrastructure: The entire lifecycle runs on cloud-hosted runners, requiring no persistent local hardware.
4. Structured Audit Documentation: Maintains a comprehensive, version-controlled history of all autonomous outputs.
5. Optimized Version Control Hygiene: Incorporates conditional commit logic and [skip ci] flags to prevent recursive workflow execution.

---

## Repository Structure

```text
├── .github/workflows/
│   └── aura-automation.yml  # CI/CD pipeline and automation configuration
├── index.js                 # Core orchestration and failover logic
├── posts_log.md             # Persistent Markdown-based audit logs
├── package.json             # Dependency manifest and metadata
└── .gitignore               # Secure exclusion of environment configurations

```

---

## Deployment and Local Configuration

### Prerequisites

1. Node.js Environment (v20.0.0 or higher)
2. API Credentials for Groq Cloud and Hugging Face
3. GitHub Personal Access Token (PAT) with repo and workflow scopes

### Installation Steps

1. Clone Repository:
```bash
git clone [https://github.com/Priom-Das/Aura-Core.git](https://github.com/Priom-Das/Aura-Core.git)
cd Aura-Core

```


2. Dependency Installation:
```bash
npm install

```


3. Environment Setup:
Configure a .env file in the root directory with the following variables:
```env
GROQ_API_KEY=your_credential
HF_TOKEN=your_credential
GITHUB_TOKEN=your_credential

```


4. Local Execution:
```bash
node index.js

```



---

## Future Roadmap

1. Implementation of Vector Databases: Integration of Pinecone/Milvus for RAG-based context, allowing the agent to utilize custom domain knowledge.
2. Real-time Notifications: Integration with Slack/Discord webhooks for immediate autonomous status updates.
3. Multi-region Deployment: Strategic distribution of execution nodes for absolute zero-downtime orchestration.

---

## Engineering Competencies Demonstrated

1. Runtime Systems: Advanced Node.js development including File System (FS) and Asynchronous operations.
2. API Management: Orchestration of RESTful services from disparate AI infrastructure providers.
3. DevOps Engineering: Implementation of CI/CD pipelines and YAML-based automation.
4. Security Engineering: Strategic management of environment variables and encrypted secret injection.
5. Systems Design: Fault-tolerant architecture and automated redundancy protocols.

---

## License

This project is licensed under the MIT License. Developed and maintained by Priom Das as a demonstration of autonomous systems engineering.

```



