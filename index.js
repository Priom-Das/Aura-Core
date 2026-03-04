/*
 * Project Aura - Autonomous AI Agent
 * Version: 1.3.7 (Integrated Dual-AI with Source Tracking)
 */

require('dotenv').config();
const fs = require('fs');
const axios = require('axios');
const simpleGit = require('simple-git');
const { HfInference } = require('@huggingface/inference');
const { TwitterApi } = require('twitter-api-v2');

const git = simpleGit();
const hf = new HfInference(process.env.HF_TOKEN);
const AGENT_NAME = "Aura";

const X_CLIENT = new TwitterApi({
    appKey: process.env.X_CONSUMER_KEY,
    appSecret: process.env.X_SECRET_KEY,
    accessToken: process.env.X_ACCESS_TOKEN,
    accessSecret: process.env.X_ACCESS_TOKEN_SECRET,
});

/**
 * Generates content and identifies which AI provider was used.
 * Logs the source to GitHub Actions console for traceability.
 */
async function generateAuraInsights() {
    /* Step 1: Generate technical base using Hugging Face (Llama 3.2) */
    const hfResponse = await hf.chatCompletion({
        model: "meta-llama/Llama-3.2-1B-Instruct",
        messages: [{ role: "user", content: "Write a professional one-sentence technical log about AI automation. Under 12 words." }],
        max_tokens: 30,
        temperature: 0.7
    });
    const techLog = hfResponse.choices[0].message.content.trim();

    /* Step 2: Attempt refinement via Gemini 1.5 Flash */
    try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

        const geminiPrompt = {
            contents: [{
                parts: [{
                    text: `You are ${AGENT_NAME}. Rewrite this technical log: "${techLog}" into an engaging LinkedIn and X post. Use one emoji.`
                }]
            }]
        };

        const geminiResponse = await axios.post(geminiUrl, geminiPrompt);
        const finalContent = geminiResponse.data.candidates[0].content.parts[0].text.trim();

        /* Successful identification log */
        console.log("[AI SOURCE] Active Provider: Google Gemini 1.5 Flash");
        return finalContent;

    } catch (error) {
        /* Fallback mechanism if Gemini returns 404 or fails */
        console.warn("[AI SOURCE] Active Provider: Hugging Face (Fallback Mode)");
        return `${techLog} ⚙️ #ProjectAura`;
    }
}

async function postToLinkedIn(content) {
    const url = 'https://api.linkedin.com/v2/ugcPosts';
    const body = {
        author: `urn:li:person:${process.env.LINKEDIN_PERSON_ID}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
            'com.linkedin.ugc.ShareContent': {
                shareCommentary: { text: content },
                shareMediaCategory: 'NONE'
            }
        },
        visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' }
    };

    return axios.post(url, body, {
        headers: {
            'Authorization': `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}`,
            'X-Restli-Protocol-Version': '2.0.0',
            'Content-Type': 'application/json'
        }
    });
}

/**
 * Primary execution engine
 */
async function runAuraAutonomous() {
    console.log(`--- [SYSTEM] ${AGENT_NAME} Force Cycle Initiated ---`);

    try {
        /* Content Synthesis */
        const humanInsight = await generateAuraInsights();
        console.log(`[CONTENT] Final Payload: ${humanInsight}`);

        /* Local File Persistence */
        const timestamp = new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" });
        const logEntry = `\n[${timestamp}] ${AGENT_NAME}: ${humanInsight}`;
        fs.appendFileSync('progress_log.txt', logEntry);
        console.log("[FILE] Local logs updated.");

        /* Social Media Distribution */
        console.log("[SOCIAL] Distributing content to LinkedIn and X...");
        await Promise.all([
            postToLinkedIn(humanInsight).catch(e => console.error("[LinkedIn Error]", e.message)),
            X_CLIENT.v2.tweet(humanInsight).catch(e => console.error("[X Error]", e.message))
        ]);

        /* GitHub Version Control Synchronization */
        const TOKEN = process.env.MY_GITHUB_TOKEN?.trim();
        const remoteUrl = `https://x-access-token:${TOKEN}@github.com/Priom-Das/Project---Aura.git`;

        await git.addConfig('user.name', 'github-actions[bot]');
        await git.addConfig('user.email', 'github-actions[bot]@users.noreply.github.com');

        const remotes = await git.getRemotes();
        if (remotes.find(r => r.name === 'origin')) await git.removeRemote('origin');
        await git.addRemote('origin', remoteUrl);

        await git.add('progress_log.txt');
        await git.commit(`Automated Sync: ${AGENT_NAME} Update`);
        await git.push('origin', 'main');
        console.log("[GIT] Remote repository synchronized successfully.");

    } catch (error) {
        console.error("[CRITICAL FAILURE]", error.message);
        process.exit(1);
    }
}

runAuraAutonomous();