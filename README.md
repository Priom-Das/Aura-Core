
# Project Aura: Autonomous AI Agent v1.3.1

Project Aura is a professional-grade autonomous system designed for automated developer insights and social media synchronization. The system leverages multi-model AI orchestration to generate technical content and manages repository updates through GitHub Actions without manual intervention.

## Project Overview

This agent maintains a consistent digital presence by orchestrating different AI services. It follows a randomized execution pattern to ensure natural engagement across professional platforms and maintains an accurate log of all activities.

## Core Functionalities

* Multi-AI Integration: Utilizes Meta Llama 3.2 via Hugging Face for technical analysis and Google Gemini 1.5 Flash for human-like content adaptation.
* Automated Social Synchronization: Publishes synchronized updates directly to LinkedIn and X (Twitter) accounts.
* Randomized Posting Logic: Implements a probability gate and variable sleep timers to execute tasks 4 to 5 times daily at unpredictable intervals to mimic human behavior.
* Automated Documentation: Appends all generated insights into a dedicated progress log and synchronizes these changes with the remote GitHub repository.

## Technical Architecture

The workflow is triggered by GitHub Actions on a 3-hour cycle. The internal logic evaluates whether to proceed with a deployment based on a 60 percent probability threshold. Upon a successful gate pass, the agent fetches data from AI models, updates the local repository files, and broadcasts the content to social channels.

## Installation and Setup

### Prerequisites

* Node.js environment version 18 or higher.
* A GitHub account with a configured Personal Access Token.
* Verified developer accounts for LinkedIn and X (Twitter).

### Local Environment Configuration

1. Clone the repository to your local machine:
git clone [https://github.com/Priom-Das/Project---Aura.git](https://github.com/Priom-Das/Project---Aura.git)
2. Install the required Node.js dependencies:
npm install axios simple-git dotenv @huggingface/inference twitter-api-v2
3. Create a .env file in the root directory and provide the necessary API keys and tokens.

### Environment Variables

The system requires the following keys for full functionality. Ensure these are also added to GitHub Repository Secrets for cloud execution:

* HF_TOKEN: Hugging Face API access token.
* GEMINI_API_KEY: Google Generative AI API key.
* MY_GITHUB_TOKEN: Personal access token for repository management.
* LINKEDIN_ACCESS_TOKEN: OAuth 2.0 access token for LinkedIn API.
* LINKEDIN_PERSON_ID: Target profile URN for LinkedIn.
* X_CONSUMER_KEY: API key for X.
* X_SECRET_KEY: API secret for X.
* X_ACCESS_TOKEN: User access token for X.
* X_ACCESS_TOKEN_SECRET: User access secret for X.

## Execution and Deployment

The project is configured for serverless execution via GitHub Actions. Once the repository secrets are configured, the main.yml workflow handles all subsequent tasks. You can monitor the execution progress in the Actions tab of the repository.

## Troubleshooting

* GitHub Push Errors: Ensure the GitHub token has both repo and workflow scopes enabled.
* API Rate Limits: The probability gate is designed to keep the agent within the free tier limits of most AI providers.
* Social Media Failures: Verify that the LinkedIn access token has not expired and that the X API keys have write permissions enabled.

## License

This project is maintained as an autonomous development tool. All rights reserved.

Developed by Priom Das.
