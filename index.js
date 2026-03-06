/**
 * @file index.js
 * @description Autonomous AI agent with multi-provider failover logic.
 * @author Priom Das
 * @version 2.1.0
 */

require('dotenv').config();
const fs = require('fs');
const axios = require('axios');

/**
 * Generates technical insights by switching between Groq (Primary) and Hugging Face (Fallback).
 * @returns {Promise<string>} The generated AI content.
 */
async function getTechnicalInsight() {
    const prompt = "Provide a concise, professional technical insight for software engineers in 2026. Focus on AI integration or system design.";

    // --- Primary Provider: Groq Cloud (Llama-3-8b) ---
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

        console.log("[Status] Primary Node (Groq) successfully generated content.");
        return groqResponse.data.choices[0].message.content.trim();

    } catch (primaryError) {
        console.warn("[Warning] Primary Node failed. Switching to Fallback Node (Hugging Face)...");

        // --- Fallback Provider: Hugging Face (Mistral-7B) ---
        try {
            const hfResponse = await axios.post(
                'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-v0.1', { inputs: `<s>[INST] ${prompt} [/INST]` }, {
                    headers: {
                        'Authorization': `Bearer ${process.env.HF_TOKEN}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log("[Status] Fallback Node (Hugging Face) successfully generated content.");

            // Clean Mistral output to remove the input prompt from the response
            let rawText = hfResponse.data[0].generated_text || hfResponse.data[0].summary_text;
            return rawText.split('[/INST]').pop().trim();

        } catch (fallbackError) {
            console.error("[Critical] All AI nodes are unreachable.");
            return "Resilience in automation is built through redundant systems and continuous monitoring.";
        }
    }
}

/**
 * Main execution cycle for the AI Agent.
 */
async function executeAgentCycle() {
    console.log("[System] Initiating Autonomous Content Generation...");

    try {
        const insight = await getTechnicalInsight();
        const timestamp = new Date().toLocaleString('en-US', { timeZone: 'UTC' });

        // Formatting the log entry in professional Markdown
        const logEntry = `\n---\n### Runtime: ${timestamp} (UTC)\n\n> ${insight}\n`;

        // Synchronous file append to maintain data integrity
        fs.appendFileSync('posts_log.md', logEntry);
        console.log("[Success] Content synchronized to posts_log.md");

    } catch (err) {
        console.error("[Error] Cycle Aborted: " + err.message);
        process.exit(1);
    }
}

// Global process entry point
executeAgentCycle();