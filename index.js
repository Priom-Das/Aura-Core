/**
 * @file index.js
 * @description Advanced Autonomous Agent for Project Aura.
 * Handles AI content generation with multi-layered fallback mechanisms.
 * Updated to support 2026 API endpoints and versatile models.
 * @author Priom Das
 * @version 2.4.2
 */

require('dotenv').config();
const fs = require('fs');
const axios = require('axios');

/**
 * Fetches technical insights from AI providers with error diagnostics.
 * @returns {Promise<object>} Returns an object containing content and provider metadata.
 */
async function getTechnicalInsight() {
    // Professional architectural prompt focused on 2026 technical trends
    const optimizedPrompt = `Act as a world-class Software Architect in 2026. 
    Provide one deep technical insight regarding microservices or AI-native infrastructure. 
    Keep it under 60 words. Avoid generic advice.`;

    /** * Primary Execution: Groq Cloud 
     * Model: llama-3.3-70b-versatile
     */
    try {
        const groqResponse = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions', {
                model: "llama-3.3-70b-versatile",
                messages: [{ role: "user", content: optimizedPrompt }],
                temperature: 0.6
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 12000
            }
        );

        return {
            content: groqResponse.data.choices[0].message.content.trim(),
            provider: "Groq (Llama-3.3-Versatile)"
        };

    } catch (primaryError) {
        // Logging technical diagnostics for system auditing
        console.error("--- Diagnostic: Primary API Node Failure ---");
        if (primaryError.response) {
            console.error(`HTTP Status: ${primaryError.response.status}`);
            console.error(`Response Data: ${JSON.stringify(primaryError.response.data)}`);
        } else {
            console.error(`Network/Timeout Error: ${primaryError.message}`);
        }

        /** * Secondary Execution: Hugging Face Fallback
         */
        try {
            const hfResponse = await axios.post(
                'https://router.huggingface.co/hf-inference/models/mistralai/Mistral-7B-v0.1', {
                    inputs: `<s>[INST] ${optimizedPrompt} [/INST]`
                }, {
                    headers: {
                        'Authorization': `Bearer ${process.env.HF_TOKEN}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 15000
                }
            );

            const rawText = hfResponse.data[0].generated_text || "";
            const cleanText = rawText.includes('[/INST]') ? rawText.split('[/INST]').pop().trim() : rawText.trim();

            return {
                content: cleanText,
                provider: "Hugging Face (Mistral-7B-Router)"
            };

        } catch (fallbackError) {
            console.error("--- Diagnostic: Secondary API Node Failure ---");

            // Final static fallback to maintain system availability
            return {
                content: "Architectural Insight: Implement distributed tracing and circuit breakers to ensure observability in complex microservices environments.",
                provider: "System-Level Static Fallback"
            };
        }
    }
}

/**
 * Main execution cycle that manages logging and file synchronization.
 * Standardized Markdown formatting without any special characters or icons.
 */
async function executeAgentCycle() {
    console.log("System Status: Initializing AI Generation Cycle...");
    try {
        const result = await getTechnicalInsight();
        const timestamp = new Date().toLocaleString('en-US', { timeZone: 'UTC' });

        // Clean Markdown formatting for logs - No emojis or icons used
        const logEntry = `
---
### Aura Intelligence Report | ${timestamp} (UTC)
**Model Engine:** ${result.provider}

> ${result.content}
`;

        // Synchronous file operation to ensure data integrity
        fs.appendFileSync('posts_log.md', logEntry);
        console.log(`System Status: Cycle completed successfully via ${result.provider}`);

    } catch (err) {
        console.error("Critical Failure: Process terminated unexpectedly: " + err.message);
        process.exit(1);
    }
}

// Global invocation
executeAgentCycle();