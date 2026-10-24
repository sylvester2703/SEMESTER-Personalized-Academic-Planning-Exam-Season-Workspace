import fs from 'fs';
import path from 'path';

function checkFile(file) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  
  let inComponent = false;
  let componentName = '';
  let earlyReturnFound = false;
  let returnLineNum = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check component start
    const compMatch = line.match(/(?:export\s+(?:default\s+)?)function\s+([A-Z]\w*)/);
    if (compMatch) {
      inComponent = true;
      componentName = compMatch[1];
      earlyReturnFound = false;
      returnLineNum = 0;
      continue;
    }

    if (!inComponent) continue;

    // Detect top-level early return in component body (depth heuristic: not inside inner arrow/function)
    if ((line === 'if (!isOpen) return null;' || line === 'if (!open) return null;' || (line.startsWith('if (') && line.endsWith('return null;'))) && !line.includes('=>')) {
      earlyReturnFound = true;
      returnLineNum = i + 1;
    }

    // Detect hook calls
    if (earlyReturnFound) {
      if (/\b(useState|useEffect|useMemo|useCallback|useContext|useRef)\s*(?:<[^>]+>)?\s*\(/.test(line)) {
        console.error(`🚨 HOOK CALL AFTER EARLY RETURN in ${file}:${i + 1} (${componentName})`);
        console.error(`   Early return was on line ${returnLineNum}`);
        console.error(`   Hook call: ${line}\n`);
      }
    }
  }
}

function scan(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.next' && entry.name !== '.git') {
        scan(full);
      }
    } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
      checkFile(full);
    }
  }
}

console.log('Scanning all components for hooks after early return (React Error #310)...');
scan('components');
scan('app');
console.log('Check complete.');
