# Project Aura: Autonomous Multi-Model AI Orchestration Engine

Project Aura is an enterprise-level autonomous system designed for high-availability technical content generation. The engine implements a sophisticated failover architecture, managing multiple Large Language Models (LLMs) to ensure system resilience and continuous operation without manual intervention.

---

## Technical Architecture and Operational Workflow

The system is architected as a serverless automation pipeline, utilizing GitHub Actions for task scheduling and Node.js for core logic execution. The primary focus is on system reliability through a dual-layer AI integration strategy.

### 1. Execution Pipeline

* Trigger Mechanism: A GitHub Actions CRON job initiates the process daily at a predefined interval.
* Orchestration Logic: The Node.js environment evaluates the availability of the primary inference node.
* Primary Inference (Groq): Utilizes the Llama-3-8B model via Groq Cloud for low-latency response generation.
* Fallback Strategy (Hugging Face): Automatically redirects the request to the Mistral-7B model if the primary API experiences latency or downtime.
* Data Persistence: Generates a structured Markdown log (posts_log.md) and synchronizes the updates with the version control system.

---

## System Capabilities

* Self-Healing Design: Automated error handling that transitions between AI providers to eliminate single points of failure.
* Secured Credential Management: Implementation of GitHub Repository Secrets for encrypted storage of API keys and tokens.
* Stateless Execution Infrastructure: The entire lifecycle runs on cloud-hosted runners, requiring no persistent local hardware.
* Structured Audit Documentation: Maintains a comprehensive, version-controlled history of all autonomous outputs.
* Optimized Version Control Hygiene: Incorporates conditional commit logic and [skip ci] flags to prevent recursive workflow execution.

---

## Repository Structure

```text
├── .github/workflows/
│   └── main.yml         # CI/CD pipeline and automation configuration
├── index.js             # Core orchestration and failover logic
├── posts_log.md         # Persistent Markdown-based audit logs
├── package.json         # Dependency manifest and metadata
└── .gitignore           # Secure exclusion of environment configurations

```

## Deployment and Local Configuration

### Prerequisites

* Node.js Environment (v20.0.0 or higher)
* API Credentials for Groq Cloud and Hugging Face
* GitHub Personal Access Token (PAT) with repo and workflow scopes

### Installation Steps

1. Clone Repository:
git clone [https://github.com/Priom-Das/Project---Aura.git](https://www.google.com/search?q=https://github.com/Priom-Das/Project---Aura.git)
cd Project---Aura
2. Dependency Installation:
npm install
3. Environment Setup:
Configure a .env file in the root directory with the following variables:
GROQ_API_KEY=your_credential
HF_TOKEN=your_credential
MY_GITHUB_TOKEN=your_credential
4. Local Execution:
node index.js

## Engineering Competencies Demonstrated

* Runtime Systems: Advanced Node.js development including File System (FS) and Asynchronous operations.
* API Management: Orchestration of RESTful services from disparate AI infrastructure providers.
* DevOps Engineering: Implementation of CI/CD pipelines and YAML-based automation.
* Security Engineering: Strategic management of environment variables and encrypted secret injection.
* Systems Design: Fault-tolerant architecture and automated redundancy protocols.


## License

This project is licensed under the MIT License. Developed and maintained by Priom Das as a demonstration of autonomous systems engineering.
