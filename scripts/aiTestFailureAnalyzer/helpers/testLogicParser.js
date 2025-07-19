import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function extractImports(fileContent) {
  // find * imports
  let importRegex = /import \* as (\w+) from ['"](.+?)['"]/g;
  const imports = [];
  let match;
  while ((match = importRegex.exec(fileContent))) {
    // Only include relative (internal) imports
    if (match[2].startsWith('.') || match[2].startsWith('/')) {
      imports.push({ ns: match[1], relPath: match[2] });
    }
  }

  // find VAR imports
  importRegex = /import\s+({\s+[\w\s,]+\s+}|[\w\s]+)\s+from\s+['"](.+?)['"]/g;
  while ((match = importRegex.exec(fileContent))) {
    if (match[2].startsWith('.') || match[2].startsWith('/')) {
      imports.push({ ns: match[1], relPath: match[2], isDefault: true });
    }
  }
  return imports;
}

function findUsedFunctions(fileContent, ns) {
  const used = new Set();
  const usageRegex = new RegExp(ns + '\\.(\\w+)\\s*\\(', 'g');
  let match;
  while ((match = usageRegex.exec(fileContent))) {
    used.add(match[1]);
  }
  return used;
}

function extractFunctionCode(depContent, fnName) {
  // Match exported function declarations (ignore types/generics)
  const fnRegex = new RegExp(`(?:export\\s+)?function\\s+${fnName}\\s*\\([^)]*\\)\\s*{[\\s\\S]*?^\\s*}`, 'm');
  let fnMatch = depContent.match(fnRegex);
  if (fnMatch) return fnMatch[0];

  // Match exported arrow functions (ignore types)
  const arrowRegex = new RegExp(
    `(?:export\\s+)?(?:const|let|var)\\s+${fnName}\\s*=\\s*(?:async\\s*)?\\([^)]*\\)\\s*=>\\s*{[\\s\\S]*?^\\s*}`,
    'm'
  );
  fnMatch = depContent.match(arrowRegex);
  if (fnMatch) return fnMatch[0];

  // Match exported function expressions (ignore types)
  const exprRegex = new RegExp(
    `(?:export\\s+)?(?:const|let|var)\\s+${fnName}\\s*=\\s*function\\s*\\([^)]*\\)\\s*{[\\s\\S]*?^\\s*}`,
    'm'
  );
  fnMatch = depContent.match(exprRegex);
  if (fnMatch) return fnMatch[0];

  // Match export { foo } at end of file (grab function/const above)
  const exportListRegex = new RegExp(`export\\s*{[^}]*\\b${fnName}\\b[^}]*}`, 'm');
  if (exportListRegex.test(depContent)) {
    // Try to find function declaration or const above
    const fnDeclRegex = new RegExp(
      `function\\s+${fnName}\\s*\\([^)]*\\)\\s*{[\\s\\S]*?^\\s*}|(?:const|let|var)\\s+${fnName}\\s*=\\s*(?:async\\s*)?\\([^)]*\\)\\s*=>\\s*{[\\s\\S]*?^\\s*}`,
      'm'
    );
    fnMatch = depContent.match(fnDeclRegex);
    if (fnMatch) return fnMatch[0];
  }
  return null;
}

function extractConstantKeyValues(depPath, constName) {
  // Read the file content
  if (!fs.existsSync(depPath)) return [];
  const content = fs.readFileSync(depPath, 'utf8');
  // Regex to match: const constName = { ... };
  const regex = new RegExp(`const\\s+${constName}\\s*=\\s*({[\\s\\S]*?})\\s*;`, 'm');
  const match = content.match(regex);
  if (match) {
    // Return the object literal as a string
    return [match[1]];
  }
  return [];
}

export default function parseTestFileWithDependencies(testFilePath) {
  const testFileAbs = path.resolve(testFilePath);
  const testContent = fs.readFileSync(testFileAbs, 'utf8');
  const dependencies = [];
  const visited = new Set();

  function extractRecursively(fileAbsPath, fileContent, parentNs = null, parentFns = null) {
    const imports = extractImports(fileContent);
    for (const { ns, relPath } of imports) {
      // Special handling for support/constants dependencies
      if (relPath.includes('/support/constants')) {
        const depPath = path.resolve(
          path.dirname(fileAbsPath),
          relPath.endsWith('.js') || relPath.endsWith('.ts') ? relPath : relPath + '.js'
        );
        if (!fs.existsSync(depPath)) continue;
        if (visited.has(depPath)) continue; // Prevent duplicate extraction
        const depContent = fs.readFileSync(depPath, 'utf8');
        dependencies.push({
          path: depPath,
          usedFns: ['ALL_CONSTANTS'],
          code: [depContent],
        });
        visited.add(depPath); // Mark as visited
        continue; // Skip normal logic for this dependency
      }
      const depPath = path.resolve(
        path.dirname(fileAbsPath),
        relPath.endsWith('.js') || relPath.endsWith('.ts') ? relPath : relPath + '.js' // Prefer .js, fallback to .ts
      );
      if (!fs.existsSync(depPath)) continue;
      const depContent = fs.readFileSync(depPath, 'utf8');
      // Always extract exported constants from the imported file
      const constRegex = /const\s+(\w+)\s*=\s*{([\s\S]*?)};?/g;
      let match;
      while ((match = constRegex.exec(depContent))) {
        const constName = match[1];
        const keyValues = extractConstantKeyValues(depPath, constName);
        const depKey = depPath + '::' + constName;
        if (keyValues.length > 0 && !visited.has(depKey)) {
          dependencies.push({
            path: depPath,
            constant: constName,
            code: keyValues,
          });
          visited.add(depKey);
        }
      }
      // Determine which functions to extract
      let usedFns;
      if (parentNs && parentFns) {
        // Only extract functions called from parentFns code
        usedFns = new Set();
        for (const fnCode of parentFns) {
          for (const f of findUsedFunctions(fnCode, ns)) usedFns.add(f);
        }
      } else {
        // Top-level: extract functions used in test file
        usedFns = findUsedFunctions(fileContent, ns);
      }
      const depEntry = dependencies.find(d => d.path === depPath);
      let depCodeArr = depEntry ? depEntry.code : [];
      let depUsedFnsArr = depEntry ? depEntry.usedFns : [];
      for (const fn of usedFns) {
        const visitKey = `${depPath}:${fn}`;
        if (visited.has(visitKey)) continue;
        visited.add(visitKey);
        const fnCode = extractFunctionCode(depContent, fn);
        if (!fnCode) continue;
        depCodeArr.push(fnCode);
        depUsedFnsArr.push(fn);
        // Recursively extract further dependencies used by this function
        extractRecursively(depPath, depContent, ns, [fnCode]);
      }
      // Only push if not already in dependencies
      if (!depEntry && depCodeArr.length > 0) {
        dependencies.push({ path: depPath, usedFns: depUsedFnsArr, code: depCodeArr });
      } else if (depEntry) {
        depEntry.usedFns = depUsedFnsArr;
        depEntry.code = depCodeArr;
      }
    }
  }

  // Start recursive extraction from test file
  extractRecursively(testFileAbs, testContent);

  // Add Cypress custom command signatures
  const commandsPath = path.resolve(__dirname, '../../../cypress/support/commands.js');
  if (fs.existsSync(commandsPath)) {
    const commandsContent = fs.readFileSync(commandsPath, 'utf8');
    // Regex to match all forms of Cypress.Commands.add
    const cmdRegex =
      /Cypress\.Commands\.add\((['"])(\w+)\1,\s*(?:\(([^)]*)\)|([a-zA-Z0-9_]+))\s*=>|Cypress\.Commands\.add\((['"])(\w+)\5,\s*function\s*\(([^)]*)\)/g;
    let match;
    const signatures = [];
    while ((match = cmdRegex.exec(commandsContent))) {
      const name = match[2] || match[6];
      // Prefer (args) group, then single arg, then function args
      const args =
        typeof match[3] === 'string' && match[3] !== undefined
          ? match[3].replace(/\s+/g, ' ').trim()
          : typeof match[4] === 'string' && match[4] !== undefined
          ? match[4].trim()
          : typeof match[7] === 'string' && match[7] !== undefined
          ? match[7].replace(/\s+/g, ' ').trim()
          : '';
      signatures.push(`Cypress.Commands.add('${name}', (${args}) => ...)`);
    }
    const commandsStr = 'Cypress custom command signatures:\n' + signatures.map(sig => '  ' + sig).join('\n');
    if (signatures.length > 0) {
      dependencies.push({
        path: commandsPath,
        usedFns: ['COMMAND_SIGNATURES'],
        code: [commandsStr],
      });
    }
  }

  return {
    testFile: { path: testFileAbs, content: testContent },
    dependencies,
  };
}
