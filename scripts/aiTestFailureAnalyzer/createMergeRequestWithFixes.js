#!/usr/bin/env node
/**
 * Script to auto-create a merge request with any changes made by the Bedrock analysis/fix step.
 * Usage: node scripts/aiTestFailureAnalyzer/createMergeRequestWithFixes.js
 *
 * Requirements:
 * - GITLAB_API_TOKEN (API scope) must be set in the environment.
 * - CI_PROJECT_ID must be set (GitLab CI provides this automatically).
 * - GITLAB_USER_ID must be set (GitLab user ID of the user to assign the MR to).
 *
 * This script should be run after any auto-fix step (e.g., analyzeTestFailures.js).
 */

/* global process */

import { execSync } from 'child_process';
import { Buffer } from 'buffer';
import https from 'https';

const API_BASE_URL = 'https://gitlab.on.ag/api/v4/projects';
const MR_BRANCH_TITLE = `auto/bedrock-fix-${getDateOfToday()}`;

function getDateOfToday() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function hasUncommittedChanges() {
  try {
    execSync('git diff --quiet');
    return false;
  } catch {
    return true;
  }
}

async function createBranch({ branch, ref = 'master', token, projectId }) {
  const data = JSON.stringify({
    branch,
    ref,
  });
  const url = `${API_BASE_URL}/${projectId}/repository/branches`;
  const options = {
    method: 'POST',
    headers: {
      'PRIVATE-TOKEN': token,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data),
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

async function createMergeRequest({ branch, title, target = 'master', token, projectId, assigneeId }) {
  const data = JSON.stringify({
    source_branch: branch,
    target_branch: target,
    title,
    remove_source_branch: true,
    squash: true,
    assignee_id: assigneeId,
  });
  const url = `${API_BASE_URL}/${projectId}/merge_requests`;
  const options = {
    method: 'POST',
    headers: {
      'PRIVATE-TOKEN': token,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data),
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
          reject(new Error(`Failed to create MR: ${res.statusCode} ${body}`));
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
  const token = process.env.GITLAB_API_TOKEN;
  const projectId = process.env.CI_PROJECT_ID;
  if (!token || !projectId) {
    throw new Error('GITLAB_API_TOKEN and CI_PROJECT_ID must be set in the environment.');
  }
  try {
    await createBranch({
      branch: MR_BRANCH_TITLE,
      token,
      projectId,
    });
    const mr = await createMergeRequest({
      branch: MR_BRANCH_TITLE,
      title: `Draft: ${MR_BRANCH_TITLE}`,
      token,
      projectId,
    });
    console.log('Merge request created:', mr);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
