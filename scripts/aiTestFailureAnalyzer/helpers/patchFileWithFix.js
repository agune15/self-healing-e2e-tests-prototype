/* eslint-disable */

import fs from 'fs';

export function patchFunctionInFile({ file, function: functionName, before, after }) {
  const content = fs.readFileSync(file, 'utf8');
  let patched = false;

  // Handle Cypress test blocks: it('desc', ...) or describe('desc', ...)
  if (/^(it|describe)\s*\(/.test(functionName.trim())) {
    // Extract the description string (single or double quoted)
    const descMatch = functionName.match(/^[^(]+\(['"]([^'"]+)['"]/);
    if (descMatch) {
      const desc = descMatch[1];
      // Escape all regex metacharacters for safe matching
      const escapeRegex = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const descEscaped = escapeRegex(desc);
      // Find the it/describe line with the description
      const testLineRegex = new RegExp(`(it|describe)\\s*\\(\\s*(['"])${descEscaped}\\2`);
      if (testLineRegex.test(content)) {
        if (content.includes(before)) {
          const newContent = content.replace(before, after);
          fs.writeFileSync(file, newContent, 'utf8');
          console.log(`Patched Cypress test (by description) in ${file}:\n---\n${before}\n>>>\n${after}`);
          return true;
        } else {
          console.error(`'before' code not found in file for test '${desc}'. No changes made.`);
          return false;
        }
      } else {
        console.error(`Cypress test block with description '${desc}' not found. No changes made.`);
        return false;
      }
    } else {
      console.warn(`Could not extract description from function signature: ${functionName}. Trying fallback.`);
      // Fallback: try replacing anywhere in the file
      if (content.includes(before)) {
        const newContent = content.replace(before, after);
        fs.writeFileSync(file, newContent, 'utf8');
        console.log(`Patched (fallback) in ${file}:\n---\n${before}\n>>>\n${after}`);
        return true;
      } else {
        console.error(`'before' code not found anywhere in file. No changes made.`);
        return false;
      }
    }
  }

  // Default: patch named function as before
  const fnName = functionName.split('(')[0].trim();
  const fnRegex = new RegExp(
    `(export\\s+)?function\\s+${fnName}\\s*\\([^)]*\\)\\s*(:\\s*[^\\s{]+)?\\s*{([\\s\\S]*?)^\\s*}`,
    'm'
  );
  const match = content.match(fnRegex);
  if (!match) {
    console.error(`Function '${fnName}' not found in file. No changes made.`);
    return false;
  }
  const fnBlock = match[0];
  if (!fnBlock.includes(before)) {
    console.error(`Before snippet not found in function '${fnName}'. No changes made.`);
    return false;
  }
  const patchedFn = fnBlock.replace(before, after);
  patched = content.replace(fnBlock, patchedFn);
  fs.writeFileSync(file, patched, 'utf8');
  console.log(`Patched ${file}:\n---\n${before}\n>>>\n${after}`);
  return true;
}
