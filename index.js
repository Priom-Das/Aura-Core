/*
 * Project Aura - Autonomous AI Agent
 * Version: 1.3.4 (Force Execution & Logging Fix)
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

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function generateAuraInsights() {
    const hfResponse = await hf.chatCompletion({
        model: "meta-llama/Llama-3.2-1B-Instruct",
        messages: [{ role: "user", content: "Write a professional one-sentence technical log about AI automation. Under 12 words." }],
        max_tokens: 30,
        temperature: 0.7
    });
    const techLog = hfResponse.choices[0].message.content.trim();


    /* Standardized Gemini Pro Endpoint - Most Compatible */
    /* Corrected Stable Gemini Endpoint */
    const geminiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const geminiPrompt = {
        contents: [{
            parts: [{
                text: `You are ${AGENT_NAME}. Rewrite this technical log: "${techLog}" into an engaging LinkedIn and X post. Use one emoji.`
            }]
        }]
    };
    const geminiResponse = await axios.post(geminiUrl, geminiPrompt);
    return geminiResponse.data.candidates[0].content.parts[0].text.trim();
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
    console.log(`--- [SYSTEM] ${AGENT_NAME} Force Cycle Initiated ---`);

    try {
        // Step 1: Content Generation
        const humanInsight = await generateAuraInsights();
        console.log(`[CONTENT] Generated: ${humanInsight}`);

        // Step 2: Immediate Local Logging
        const timestamp = new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" });
        const logEntry = `\n[${timestamp}] ${AGENT_NAME}: ${humanInsight}`;
        fs.appendFileSync('progress_log.txt', logEntry);
        console.log("[FILE] Progress log updated locally.");

        // Step 3: Social Media Post
        console.log("[SOCIAL] Posting to platforms...");
        await Promise.all([
            postToLinkedIn(humanInsight),
            X_CLIENT.v2.tweet(humanInsight)
        ]);
        console.log("[SUCCESS] Posted to LinkedIn and X.");

        // Step 4: GitHub Sync
        const TOKEN = process.env.MY_GITHUB_TOKEN?.trim();
        const remoteUrl = `https://x-access-token:${TOKEN}@github.com/Priom-Das/Project---Aura.git`;

        await git.addConfig('user.name', 'github-actions[bot]');
        await git.addConfig('user.email', 'github-actions[bot]@users.noreply.github.com');

        const remotes = await git.getRemotes();
        if (remotes.find(r => r.name === 'origin')) await git.removeRemote('origin');
        await git.addRemote('origin', remoteUrl);

        await git.add('progress_log.txt');
        await git.commit(`Automated Sync: ${AGENT_NAME} Log Update`);
        await git.push('origin', 'main');
        console.log("[GIT] progress_log.txt pushed to GitHub.");

    } catch (error) {
        console.error("[CRITICAL FAILURE]", error.response ? error.response.data : error.message);
        process.exit(1);
    }
}

runAuraAutonomous();