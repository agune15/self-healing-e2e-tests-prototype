/**
 * Script to analyze test failures and suggest or apply fixes using Gemini.
 * Usage: node scripts/aiTestFailureAnalyzer/analyzeTestFailures.js
 *
 * Requirements:
 * - GEMINI_API_KEY must be set in the environment.
 *
 * This script is intended to be run after test execution, before any auto-fix or MR creation step.
 */

/* global process */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import parseTestFileWithDependencies from './helpers/testLogicParser.js';
import { parseValidationMessages } from './helpers/htmlSnapshotParser.js';
import { patchFunctionInFile } from './helpers/patchFileWithFix.js';
import dotenv from 'dotenv';

// CONFIGURATION:
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MOCHA_REPORTS_DIR = path.join(__dirname, '../../reports/mocha-reports/.jsons');
const SNAPSHOT_DIR = path.join(__dirname, '../../reports/snapshots');
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || dotenv.config().parsed.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable must be set.');
}
const genAI = new GoogleGenAI(GEMINI_API_KEY);
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

function getReportFiles() {
  return fs
    .readdirSync(MOCHA_REPORTS_DIR)
    .filter(f => {
      const fullPath = path.join(MOCHA_REPORTS_DIR, f);
      return f.endsWith('.json') && fs.statSync(fullPath).isFile();
    })
    .map(f => path.join(MOCHA_REPORTS_DIR, f));
}

function getSnapshotFileName(testName) {
  return `${testName.replace(/\s/g, '')}.html`;
}

function testLogicString(parsed) {
  let logicStr = `// Test File: ${parsed.testFile.path}\n${parsed.testFile.content}\n`;
  for (const dep of parsed.dependencies) {
    if (dep.usedFns.length === 1 && dep.usedFns[0] === 'ALL') {
      logicStr += `\n// Dependency (full file): ${dep.path}\n${dep.code[0]}\n`;
    } else {
      logicStr += `\n// Dependency: ${dep.path}\n`;
      for (const fn of dep.code) {
        logicStr += `${fn}\n`;
      }
    }
  }
  return logicStr;
}

function buildPrompt(testTitle, error, testFile, testFileAndDependenciesLogic, htmlValidationMessages, html) {
  return `A Cypress test failed with the following details:

Test Title: ${testTitle}
Error: ${error}
Test File: ${testFile}

Test File and Dependencies Logic:
${testFileAndDependenciesLogic}

HTML Validation Messages:
${htmlValidationMessages}

HTML Snapshot of the page body at failure:
${html}

Instructions:
1. Analyze the error, test logic, and HTML snapshot. Focus on common causes such as:
   - Selector mismatches (renamed/missing data-cy, ID, class, etc.)
   - Assertion mismatches (wrong text, timing issues, elements not visible)
   - Required user input not provided (unchecked checkboxes, missing form data)
   - Input formatting/validation errors
   - API/network delays or environment-specific differences
   - Use of incorrect or outdated custom commands
   - Elements that no longer exist

2. Use these advanced strategies in your analysis:
   - Component-level identification: Detect known UI components (e.g. <frontend-checkbox-accordion>) in the HTML and check if a specific custom command exists for interacting with them. Prefer using that command if relevant.
   - Data-cy to component association: Use the data-cy attribute to infer the type of component it belongs to and validate that the test uses the correct command for interacting with that component.
   - Root cause vs. symptom: If the error mentions a child element (e.g., span not found), inspect the parent component with the data-cy attribute to determine whether the issue is incorrect usage of a component or command.
   - Hierarchical DOM traversal: When a cy.get() fails, traverse up the DOM to find the parent data-cy element and identify its tag/component type. Use this to suggest a better interaction pattern if appropriate.

3. Once the issue is identified, suggest a fix:
   - If it's a selector mismatch, provide the corrected selector.
   - If it's a text or formatting mismatch, match the expected value to what's present in the HTML.
   - If required user input or a checkbox is missing, suggest the correct interaction.
   - If a custom component is misused (e.g., using cy.typeInput instead of cy.clickCheckboxAccordion), recommend the correct custom command.
   - If an element no longer exists, remove the interaction.
   - If the fix is not possible or unclear, flag it and explain why.

4. Propose fixes as a JSON array. Each fix must include:
   - isFixable: "YES" or "NO"
   - explanation: brief diagnosis and rationale
   - fixes: array of fix objects, each containing:
     - file: exact file path of file to fix (contains the function where the "before" line appears in the provided test code)
     - function: name or signature of the function where the "before" line appears in the provided test code
     - before: exact code to be replaced, as it appears in the provided test file content (do not guess or invent).
     - after: exact code after fix

Note: When proposing fixes:
   - Before suggesting a fix, ensure the exact code to be replaced exists in the provided test file and function.
   - Prefer using existing variables or test data (e.g., prospect properties, fixtures, helper methods) instead of hardcoded strings or values. For example, if the test already uses a prospect.phoneNumber, use that instead of hardcoding "1234567890". Only hardcode values when no reusable data is available.
   - Prefer using existing commands and helper methods instead of writing new code. For example, instead of writing new code to interact with an autocomplete component, use the existing command cy.typeAutocomplete.

Response format (JSON):
[
  {
    "isFixable": "YES/NO answer if this issue can be quickly fixed",
    "explanation": "Brief explanation of the issue and fix",
    "fixes": [
      {
        "file": "path/to/file",
        "function": "function signature",
        "before": "code snippet before fix",
        "after": "code snippet after fix"
      }
    ]
  },
  ...
]

Example positive response JSON:
[
  {
    "isFixable": "YES",
    "explanation": "The HTML snapshot shows that the element \`input[data-cy="day"]\` is present, but the test is looking for \`input[data-cy="Tag"]\`. It also shows that the element \`input[data-cy="month"]\` is present, but the test is looking for \`input[data-cy="Monat"]\`. This indicates a discrepancies in the expected elements attributes. ",
    "fixes": [
      {
        "file": "/Users/alex.oller/repos/piedpipertests/cypress/support/authApp.ts",
        "function": "inputDateOfBirth(dateOfBirth: { day: string; month: string; year: string }): void",
        "before": "cy.typeInput('Tag', dateOfBirth.day);",
        "after": "cy.typeInput('day', dateOfBirth.day);"
      },
      {
        "file": "/Users/alex.oller/repos/piedpipertests/cypress/support/authApp.ts",
        "function": "inputDateOfBirth(dateOfBirth: { day: string; month: string; year: string }): void",
        "before": "cy.typeInput('Monat', dateOfBirth.month);",
        "after": "cy.typeInput('month', dateOfBirth.month);"
      }
    ]
  }
]

Example no fix response JSON:
{
  "isFixable": "NO",
  "explanation": "The required element or attribute (e.g., [datacy='accept-privacy-policy']) is not present in the HTML snapshot and it is unclear which line of test code should be removed. Investigate whether the application is rendering this element correctly, or if the test is out of date.",
  "fixes": []
}

Important: Be strict with the response format and don't return anything else apart from the JSON.`;
}

function collectFailuresFromReports(reportFiles) {
  const failures = [];
  for (const reportFile of reportFiles) {
    const report = JSON.parse(fs.readFileSync(reportFile, 'utf8'));
    for (const result of report.results || []) {
      for (const suite of result.suites || []) {
        for (const test of suite.tests || []) {
          if (test.state === 'failed') {
            const snapshotFile = path.join(SNAPSHOT_DIR, getSnapshotFileName(test.fullTitle));
            const testFile = result.fullFile || suite.fullFile;
            const parsed = parseTestFileWithDependencies(testFile);
            failures.push({
              title: test.fullTitle,
              error: test.err && test.err.estack,
              testFile: testFile,
              snapshotFile: snapshotFile,
              testFileAndDependenciesLogic: testLogicString(parsed),
              htmlValidationMessages: JSON.stringify(parseValidationMessages(snapshotFile)),
            });
          }
        }
      }
    }
  }
  return failures;
}

async function invokeLLM(genAI, prompt) {
  fs.writeFileSync(`prompt.txt`, prompt);

  const response = await genAI.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
    config: { responseMimeType: 'application/json' },
  });
  return response.text;
}

async function handleFailure(fail, seenReasons) {
  const reason = fail.error || 'UNKNOWN_ERROR';
  if (seenReasons.has(reason)) {
    return; // Skip duplicate failure reasons
  }
  seenReasons.add(reason);

  let html = '';
  if (fs.existsSync(fail.snapshotFile)) {
    html = fs.readFileSync(fail.snapshotFile, 'utf8');
  } else {
    html = '[No snapshot found]';
  }
  const prompt = buildPrompt(
    fail.title,
    fail.error,
    fail.testFile,
    fail.testFileAndDependenciesLogic,
    JSON.stringify(parseValidationMessages(fail.snapshotFile)),
    html
  );
  console.log(`\nPrompt for test: ${fail.title}\n---\n${prompt}\n---\n`);

  try {
    const text = await invokeLLM(genAI, prompt);
    console.log(`LLM response for test: ${fail.title}\n---\n${text}\n---\n`);
    const fixes = JSON.parse(text);
    for (const fixObj of fixes) {
      if (fixObj.isFixable === 'YES' && fixObj.fixes.length > 0) {
        for (const fix of fixObj.fixes) {
          patchFunctionInFile(fix);
        }
      } else {
        console.warn(`Unfixable or missing fix for: ${fixObj.explanation}`);
      }
    }
  } catch (err) {
    console.error(`Error invoking LLM for test: ${fail.title}`, err);
  }
}

async function main() {
  const reportFiles = getReportFiles();
  const failures = collectFailuresFromReports(reportFiles);

  if (failures.length === 0) {
    console.log('No failed tests found.');
    return;
  }

  const seenReasons = new Set();

  for (const fail of failures) {
    await handleFailure(fail, seenReasons);
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
