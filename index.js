/**
 * @file index.js
 * @description Advanced Autonomous Agent with high-level architectural prompting.
 * @author Priom Das
 * @version 2.3.1
 */

require('dotenv').config();
const fs = require('fs');
const axios = require('axios');

/**
 * Generates high-quality technical insights using specialized persona prompting.
 * @returns {Promise<object>} Content and the provider used.
 */
async function getTechnicalInsight() {
    // Optimized Prompt for 2026 Trends
    const optimizedPrompt = `Act as a world-class Software Architect in 2026. 
    Provide one deep technical insight or a 'Pro-Tip' regarding microservices, 
    AI-native infrastructure, or cybersecurity. 
    Constraint: Keep it professional, highly technical, and under 60 words. 
    Avoid generic advice.`;

    // Attempt 1: Groq Cloud (Llama-3-8b)
    try {
        const groqResponse = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions', {
                model: "llama3-8b-8192",
                messages: [{ role: "user", content: optimizedPrompt }],
                temperature: 0.6
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000 // 10-second timeout
            }
        );

        return {
            content: groqResponse.data.choices[0].message.content.trim(),
            provider: "Groq (Llama-3)"
        };

    } catch (primaryError) {
        console.warn("[System] Primary Node (Groq) is throttled or unreachable. Switching to Fallback...");

        // Attempt 2: Hugging Face (Mistral-7B)
        try {
            const hfResponse = await axios.post(
                'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-v0.1', { inputs: `<s>[INST] ${optimizedPrompt} [/INST]` }, {
                    headers: {
                        'Authorization': `Bearer ${process.env.HF_TOKEN}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 15000
                }
            );

            let rawText = hfResponse.data[0].generated_text || hfResponse.data[0].summary_text || "";
            // Removing prompt from response to ensure clean log
            let cleanText = rawText.includes('[/INST]') ? rawText.split('[/INST]').pop().trim() : rawText.trim();

            return {
                content: cleanText,
                provider: "Hugging Face (Mistral-7B)"
            };

        } catch (fallbackError) {
            // Hardcoded fallback if all APIs fail
            return {
                content: "System Resilience Tip: Implement circuit breakers at the API gateway level to prevent cascading failures in distributed environments.",
                provider: "System Default (Hardcoded Insight)"
            };
        }
    }
}

/*
 Main execution and logging cycle.
 */
async function executeAgentCycle() {
    console.log("[System] Initializing Agent Cycle...");
    try {
        const result = await getTechnicalInsight();
        const timestamp = new Date().toLocaleString('en-US', { timeZone: 'UTC' });

        // Stylish Markdown formatting with clear Provider identification
        const logEntry = `
---
### ⚡ Aura Intelligence Report | ${timestamp} (UTC)
**Model Engine:** \`${result.provider}\`

> ${result.content}
`;

        // Using synchronous append to prevent race conditions during file I/O
        fs.appendFileSync('posts_log.md', logEntry);
        console.log(`[Success] Logic executed via ${result.provider}`);

    } catch (err) {
        console.error("[Fatal Error] Automation halted: " + err.message);
        process.exit(1);
    }
}

// Entry point
executeAgentCycle();