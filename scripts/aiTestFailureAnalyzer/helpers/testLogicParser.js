import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function extractNamespaceImports(fileContent) {
  const importRegex = /import \* as (\w+) from ['"](.+?)['"]/g;
  const imports = [];
  let match;
  while ((match = importRegex.exec(fileContent))) {
    // Only include relative (internal) imports
    if (match[2].startsWith('.') || match[2].startsWith('/')) {
      imports.push({ ns: match[1], relPath: match[2] });
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
  // Match exported function declarations (with types/generics)
  const fnRegex = new RegExp(
    `(?:export\\s+)?function\\s+${fnName}\\s*(<[^>]+>\\s*)?\\([^)]*\\)\\s*(:\\s*[^\\s{]+)?\\s*{[\\s\\S]*?^\\s*}`,
    'm'
  );
  let fnMatch = depContent.match(fnRegex);
  if (fnMatch) return fnMatch[0];

  // Match exported arrow functions (with types)
  const arrowRegex = new RegExp(
    `(?:export\\s+)?(?:const|let|var)\\s+${fnName}\\s*=\\s*(?:async\\s*)?\\([^)]*\\)\\s*(:\\s*[^=]+)?\\s*=>\\s*{[\\s\\S]*?^\\s*}`,
    'm'
  );
  fnMatch = depContent.match(arrowRegex);
  if (fnMatch) return fnMatch[0];

  // Match exported function expressions (with types)
  const exprRegex = new RegExp(
    `(?:export\\s+)?(?:const|let|var)\\s+${fnName}\\s*=\\s*function\\s*(<[^>]+>\\s*)?\\([^)]*\\)\\s*(:\\s*[^\\s{]+)?\\s*{[\\s\\S]*?^\\s*}`,
    'm'
  );
  fnMatch = depContent.match(exprRegex);
  if (fnMatch) return fnMatch[0];

  // Match export { foo } at end of file (grab function/const above)
  const exportListRegex = new RegExp(`export\\s*{[^}]*\\b${fnName}\\b[^}]*}`, 'm');
  if (exportListRegex.test(depContent)) {
    // Try to find function declaration or const above
    const fnDeclRegex = new RegExp(
      `function\\s+${fnName}\\s*(<[^>]+>\\s*)?\\([^)]*\\)\\s*(:\\s*[^\\s{]+)?\\s*{[\\s\\S]*?^\\s*}|(?:const|let|var)\\s+${fnName}\\s*=\\s*(?:async\\s*)?\\([^)]*\\)\\s*(:\\s*[^=]+)?\\s*=>\\s*{[\\s\\S]*?^\\s*}`,
      'm'
    );
    fnMatch = depContent.match(fnDeclRegex);
    if (fnMatch) return fnMatch[0];
  }
  return null;
}

export default function parseTestFileWithDependencies(testFilePath) {
  const testFileAbs = path.resolve(testFilePath);
  const testContent = fs.readFileSync(testFileAbs, 'utf8');
  const dependencies = [];
  const visited = new Set();

  function extractRecursively(fileAbsPath, fileContent, parentNs = null, parentFns = null) {
    const imports = extractNamespaceImports(fileContent);
    for (const { ns, relPath } of imports) {
      const depPath = path.resolve(
        path.dirname(fileAbsPath),
        relPath.endsWith('.ts') || relPath.endsWith('.js') ? relPath : relPath + '.ts'
      );
      if (!fs.existsSync(depPath)) continue;
      const depContent = fs.readFileSync(depPath, 'utf8');
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

  // Include Prospect class data fields if imported
  const prospectImportRegex = /import\s+Prospect\s+from\s+['"](.+prospect)['"]/;
  const match = testContent.match(prospectImportRegex);
  if (match) {
    let prospectPath = match[1];
    // Resolve relative to test file
    const resolvedProspectPath = path.resolve(
      path.dirname(testFileAbs),
      prospectPath.endsWith('.ts') ? prospectPath : prospectPath + '.ts'
    );
    if (fs.existsSync(resolvedProspectPath)) {
      if (!dependencies.some(dep => dep.path === resolvedProspectPath)) {
        const prospectContent = fs.readFileSync(resolvedProspectPath, 'utf8');
        const classMatch = prospectContent.match(/export\s+default\s+class\s+Prospect\s*{([\s\S]*?)^\s*}/m);
        let fieldsStr = '';
        if (classMatch) {
          const body = classMatch[1];
          const fieldRegex = /^\s*([a-zA-Z0-9_]+):\s*([^;]+);/gm;
          let fieldMatch;
          fieldsStr = 'Prospect class data fields:\n';
          while ((fieldMatch = fieldRegex.exec(body))) {
            fieldsStr += `  ${fieldMatch[1]}: ${fieldMatch[2]}\n`;
          }
        } else {
          fieldsStr = '[Could not extract Prospect class fields]';
        }
        dependencies.push({
          path: resolvedProspectPath,
          usedFns: ['DATA'],
          code: [fieldsStr],
        });
      }
    }
  }

  // Add Cypress custom command signatures
  const commandsPath = path.resolve(__dirname, '../../../cypress/support/commands.ts');
  if (fs.existsSync(commandsPath)) {
    const commandsContent = fs.readFileSync(commandsPath, 'utf8');
    // Regex to match Cypress.Commands.add('name', (args...) => ... )
    const cmdRegex = /Cypress\.Commands\.add\((['"])(\w+)\1,\s*\(([^)]*)\)\s*=>/g;
    let match;
    const signatures = [];
    while ((match = cmdRegex.exec(commandsContent))) {
      const name = match[2];
      const args = match[3].replace(/\s+/g, ' ').trim();
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
