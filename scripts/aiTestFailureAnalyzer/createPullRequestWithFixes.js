#!/usr/bin/env node
/**
 * Script to auto-create a pull request with any changes made by the Bedrock analysis/fix step.
 * Usage: node scripts/aiTestFailureAnalyzer/createPullRequestWithFixes.js
 *
 * Requirements:
 * - GITHUB_TOKEN must be set in the environment.
 * - GITHUB_REPO must be set (format: owner/repo).
 * - GITHUB_ASSIGNEE must be set (GitHub username to assign the PR to).
 *
 * This script should be run after any auto-fix step (e.g., analyzeTestFailures.js).
 */

/* global process */

import { execSync } from 'child_process';
import { Buffer } from 'buffer';
import https from 'https';

const API_BASE_URL = 'https://api.github.com';
const PR_BRANCH_TITLE = `auto/llm-fix-${getTimestamp()}`;

function getTimestamp() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}-${hh}${min}${ss}`;
}

function hasUncommittedChanges() {
  try {
    execSync('git diff --quiet');
    return false;
  } catch {
    return true;
  }
}

async function getRefSha(ref, token, repo) {
  const url = `${API_BASE_URL}/repos/${repo}/git/refs/heads/${ref}`;
  const options = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'User-Agent': 'self-healing-e2e-tests-bot/1.0.0',
    },
  };
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, res => {
      let body = '';
      res.on('data', chunk => (body += chunk));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const data = JSON.parse(body);
          resolve(data.object.sha);
        } else {
          reject(new Error(`Failed to get ref SHA: ${res.statusCode} ${body}`));
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function createBranch({ branch, ref = 'master', token, repo }) {
  const data = JSON.stringify({
    ref: `refs/heads/${branch}`,
    sha: await getRefSha(ref, token, repo),
  });
  const url = `${API_BASE_URL}/repos/${repo}/git/refs`;
  const options = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data),
      'User-Agent': 'self-healing-e2e-tests-bot/1.0.0',
    },
  };
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, res => {
      let body = '';
      res.on('data', chunk => (body += chunk));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(body);
        } else {
          reject(new Error(`Failed to create branch: ${res.statusCode} ${body}`));
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function createPullRequest({ branch, title, target = 'master', token, repo, assignee }) {
  const data = JSON.stringify({
    head: branch,
    base: target,
    title,
    draft: true,
    assignees: assignee ? [assignee] : [],
  });
  const url = `${API_BASE_URL}/repos/${repo}/pulls`;
  const options = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data),
      'User-Agent': 'self-healing-e2e-tests-bot/1.0.0',
    },
  };
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, res => {
      let body = '';
      res.on('data', chunk => (body += chunk));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(body);
        } else {
          reject(new Error(`Failed to create PR: ${res.statusCode} ${body}`));
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  if (!hasUncommittedChanges()) {
    console.log('No changes detected by Bedrock analysis.');
    return;
  }
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  const assignee = process.env.GITHUB_ASSIGNEE;
  if (!token || !repo) {
    throw new Error('GITHUB_TOKEN and GITHUB_REPO must be set in the environment.');
  }
  try {
    // Switch to new branch and commit changes
    execSync(`git checkout -b ${PR_BRANCH_TITLE}`);
    execSync('git add .');
    execSync(`git commit -m "🤖 Self-healing: Fix test failures detected by LLM analysis

Automated fixes applied by the self-healing E2E test system."`);
    execSync(`git push origin ${PR_BRANCH_TITLE}`);
    
    const pr = await createPullRequest({
      branch: PR_BRANCH_TITLE,
      title: `Draft: ${PR_BRANCH_TITLE}`,
      token,
      repo,
      assignee,
    });
    console.log('Pull request created:', pr);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
