/*
 * Project Aura - Autonomous AI Agent
 * Version: 1.3.2 (Bug Fix & Security Update)
 * Focus: High-quality content generation with error handling and secure synchronization.
 */

require('dotenv').config();
const fs = require('fs');
const axios = require('axios');
const simpleGit = require('simple-git');
const { HfInference } = require('@huggingface/inference');
const { TwitterApi } = require('twitter-api-v2');

// Core instances initialization
const git = simpleGit();
const hf = new HfInference(process.env.HF_TOKEN);
const AGENT_NAME = "Aura";

// Social Media Client for X (Twitter)
const X_CLIENT = new TwitterApi({
    appKey: process.env.X_CONSUMER_KEY,
    appSecret: process.env.X_SECRET_KEY,
    accessToken: process.env.X_ACCESS_TOKEN,
    accessSecret: process.env.X_ACCESS_TOKEN_SECRET,
});

/**
 * SECTION: UTILITY FUNCTIONS
 * Provides helper methods for randomization and delays.
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * SECTION: AI CONTENT GENERATION
 * Fixed Gemini 404 issue by using the latest stable model endpoint.
 */
async function generateAuraInsights() {
    // Phase 1: Technical insight via Llama 3.2
    const hfResponse = await hf.chatCompletion({
        model: "meta-llama/Llama-3.2-1B-Instruct",
        messages: [{
            role: "user",
            content: "Write a professional one-sentence technical log about AI automation. Under 12 words."
        }],
        max_tokens: 30,
        temperature: 0.7
    });
    const techLog = hfResponse.choices[0].message.content.trim();

    // Phase 2: Human-style adaptation via Gemini 1.5 Flash
    // Fixed: Updated to gemini-1.5-flash-latest to prevent 404 errors.
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const geminiPrompt = {
        contents: [{
            parts: [{
                text: `You are ${AGENT_NAME}. Rewrite this technical log: "${techLog}" into an engaging, human-written LinkedIn and X post. Use one emoji.`
            }]
        }]
    };

    const geminiResponse = await axios.post(geminiUrl, geminiPrompt);

    if (!geminiResponse.data.candidates || geminiResponse.data.candidates.length === 0) {
        throw new Error("Gemini API failed to generate content candidates.");
    }

    return geminiResponse.data.candidates[0].content.parts[0].text.trim();
}

/**
 * SECTION: SOCIAL MEDIA SYNC (LINKEDIN)
 * Fixed: Added Content-Type and proper error logging for LinkedIn.
 */
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

    await axios.post(url, body, {
        headers: {
            'Authorization': `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}`,
            'X-Restli-Protocol-Version': '2.0.0',
            'Content-Type': 'application/json'
        }
    });
}

/**
 * MAIN EXECUTION BLOCK
 * Handles the randomized deployment cycle 4-5 times per day.
 */
async function runAuraAutonomous() {
    // 1. Randomized probability gate (approx. 60% success rate)
    if (Math.random() > 0.6) {
        console.log("[SYSTEM] Probability gate closed. Skipping this cycle.");
        return;
    }

    // 2. Random delay to mimic human behavior (1-60 mins)
    const delayMinutes = Math.floor(Math.random() * 60) + 1;
    console.log(`[SYSTEM] Random delay active. Sleeping for ${delayMinutes} minutes...`);
    await sleep(delayMinutes * 60 * 1000);

    console.log(`--- [SYSTEM] ${AGENT_NAME} Active Cycle Started ---`);

    try {
        // Step 1: AI Content Generation
        const humanInsight = await generateAuraInsights();

        // Step 2: Persistent Local Logging (BST)
        const timestamp = new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" });
        fs.appendFileSync('progress_log.txt', `\n[${timestamp}] ${AGENT_NAME}: ${humanInsight}`);

        // Step 3: Social Media Synchronization
        console.log("[SOCIAL] Synchronizing content with LinkedIn and X...");
        await Promise.all([
            postToLinkedIn(humanInsight),
            X_CLIENT.v2.tweet(humanInsight)
        ]);

        // Step 4: GitHub Repository Synchronization
        const GITHUB_USER = "Priom-Das";
        const REPO_NAME = "Project---Aura";
        const TOKEN = process.env.MY_GITHUB_TOKEN?.trim();

        if (!TOKEN) throw new Error("MY_GITHUB_TOKEN is missing.");

        const remoteUrl = `https://x-access-token:${TOKEN}@github.com/${GITHUB_USER}/${REPO_NAME}.git`;

        await git.addConfig('user.name', 'github-actions[bot]');
        await git.addConfig('user.email', 'github-actions[bot]@users.noreply.github.com');

        const remotes = await git.getRemotes();
        if (remotes.find(r => r.name === 'origin')) await git.removeRemote('origin');
        await git.addRemote('origin', remoteUrl);

        await git.add('progress_log.txt');
        const status = await git.status();

        if (status.modified.length > 0 || status.not_added.length > 0) {
            await git.commit(`Automated Sync: ${AGENT_NAME} randomized deployment finalized.`);
            await git.push('origin', 'main');
            console.log("[SUCCESS] Repository and Social platforms fully synchronized.");
        } else {
            console.log("[IDLE] No changes detected in the log file.");
        }

    } catch (error) {
        if (error.response) {
            console.error("[CRITICAL FAILURE] Status Code:", error.response.status);
            console.error("[CRITICAL FAILURE] API Response:", JSON.stringify(error.response.data));
        } else {
            console.error("[CRITICAL FAILURE] Message:", error.message);
        }
        process.exit(1);
    }
}

runAuraAutonomous();