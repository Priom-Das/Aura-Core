/*
 * Project Aura - Autonomous AI Agent
 * Version: 1.4.0 (Free Tier Stability & Anti-Duplicate Mode)
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
 * Generates a random topic to ensure content uniqueness
 */
function getRandomTopic() {
    const topics = [
        "Cloud Computing in 2026",
        "Edge AI benefits",
        "Sustainable Tech",
        "The future of JavaScript",
        "Cybersecurity in Automation"
    ];
    return topics[Math.floor(Math.random() * topics.length)];
}

async function generateAuraInsights() {
    const topic = getRandomTopic();
    const uniqueSalt = Date.now(); // Adds uniqueness to prevent 422 errors

    /* Step 1: Hugging Face Base Generation */
    const hfResponse = await hf.chatCompletion({
        model: "meta-llama/Llama-3.2-1B-Instruct",
        messages: [{ role: "user", content: `Write a 10-word technical insight about ${topic}.` }],
        max_tokens: 30
    });
    const techLog = hfResponse.choices[0].message.content.trim();

    /* Step 2: Gemini Refinement */
    try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
        const geminiPrompt = {
            contents: [{ parts: [{ text: `Topic: ${topic}. Log: ${techLog}. Rewrite as a professional post with one emoji. Ensure it sounds different from previous posts. Reference ID: ${uniqueSalt}` }] }]
        };

        const geminiResponse = await axios.post(geminiUrl, geminiPrompt);
        console.log("[AI SOURCE] Active Provider: Google Gemini 1.5 Flash");
        return geminiResponse.data.candidates[0].content.parts[0].text.trim();

    } catch (error) {
        console.warn("[AI SOURCE] Fallback Mode Active (Hugging Face)");
        return `${techLog} ⚙️ #Aura_${uniqueSalt}`; // Added unique tag to bypass duplicate filters
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

async function runAuraAutonomous() {
    console.log(`--- [SYSTEM] ${AGENT_NAME} Optimized Cycle ---`);

    try {
        const humanInsight = await generateAuraInsights();
        console.log(`[CONTENT] Generated: ${humanInsight}`);

        const timestamp = new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" });
        fs.appendFileSync('progress_log.txt', `\n[${timestamp}] ${humanInsight}`);

        /* Concurrent Dispatch with enhanced logging */
        await Promise.all([
            postToLinkedIn(humanInsight).then(() => console.log("[SUCCESS] LinkedIn post live.")).catch(e => console.error("[LinkedIn Error]", e.response?.data?.message || e.message)),
            X_CLIENT.v2.tweet(humanInsight).then(() => console.log("[SUCCESS] X tweet live.")).catch(e => console.error("[X Error]", e.message))
        ]);

        const TOKEN = process.env.MY_GITHUB_TOKEN?.trim();
        const remoteUrl = `https://x-access-token:${TOKEN}@github.com/Priom-Das/Project---Aura.git`;
        await git.addConfig('user.name', 'github-actions[bot]');
        await git.addConfig('user.email', 'github-actions[bot]@users.noreply.github.com');
        const remotes = await git.getRemotes();
        if (remotes.find(r => r.name === 'origin')) await git.removeRemote('origin');
        await git.addRemote('origin', remoteUrl);
        await git.add('progress_log.txt');
        await git.commit(`Automated Sync: ${AGENT_NAME}`);
        await git.push('origin', 'main');

    } catch (error) {
        console.error("[CRITICAL]", error.message);
        process.exit(1);
    }
}

runAuraAutonomous();