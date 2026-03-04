/**
 * @file index.js
 * @description Autonomous AI agent that generates technical insights using a failover architecture.
 * @author Priom Das
 * @version 2.0.0
 */

require('dotenv').config();
const fs = require('fs');
const axios = require('axios');

/**
 * Orchestrates content generation by attempting multiple AI providers.
 * Primary: Groq (Llama-3), Fallback: Hugging Face (Mistral).
 * @returns {Promise<string>} Generated technical insight.
 */
async function getTechnicalInsight() {
    const prompt = "Provide a concise, professional technical insight for modern software engineers in 2026.";

    // Attempt 1: Groq Cloud API (High-performance inference)
    try {
        const groqResponse = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions', {
                model: "llama3-8b-8192",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log("Success: Content generated via Groq Primary Node.");
        return groqResponse.data.choices[0].message.content.trim();

    } catch (primaryError) {
        console.warn("Primary Provider Failed. Transitioning to Fallback Node...");

        // Attempt 2: Hugging Face Inference API (Fallback redundancy)
        try {
            const hfResponse = await axios.post(
                'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-v0.1', { inputs: `<s>[INST] ${prompt} [/INST]` }, {
                    headers: {
                        'Authorization': `Bearer ${process.env.HF_TOKEN}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log("Success: Content generated via Hugging Face Fallback Node.");
            return hfResponse.data[0].generated_text || hfResponse.data[0].summary_text;

        } catch (fallbackError) {
            console.error("Critical Failure: All AI providers are currently unreachable.");
            return "Engineering excellence requires both robust automation and strategic manual oversight.";
        }
    }
}

/**
 * Main execution function to handle content generation and filesystem logging.
 */
async function executeAgentCycle() {
    console.log("Initiating Autonomous Cycle...");

    try {
        const insight = await getTechnicalInsight();
        const timestamp = new Date().toISOString();

        // Structure log entry in Markdown format for repository visibility
        const logEntry = `\n---\n### Generation Timestamp: ${timestamp}\n\n> ${insight}\n`;

        // Synchronous append to ensure file integrity during process
        fs.appendFileSync('posts_log.md', logEntry);
        console.log("Process Complete: Log entry recorded in posts_log.md");

    } catch (err) {
        console.error("Process Aborted: " + err.message);
        process.exit(1);
    }
}

// Entry Point
executeAgentCycle();