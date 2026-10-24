import fs from 'fs';
import path from 'path';

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.next' && entry.name !== '.git') {
        scanDir(full);
      }
    } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
      checkFile(full);
    }
  }
}

function checkFile(file) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  let hasEarlyReturn = false;
  let returnLine = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // Reset if a new component or function starts
    if (line.startsWith('export function') || line.startsWith('export default function') || line.startsWith('function ')) {
      hasEarlyReturn = false;
    }
    if ((line.startsWith('if (') || line.startsWith('if(')) && line.includes('return')) {
      hasEarlyReturn = true;
      returnLine = i + 1;
    }
    if (hasEarlyReturn) {
      if (/\b(useState|useEffect|useMemo|useCallback|useContext|useRef|usePlanner|useAuth|useSearchParams|useRouter|usePathname)\s*(<[^>]+>)?\s*\(/.test(line)) {
        console.log(`VIOLATION in ${file}:${i + 1} - Hook after return on line ${returnLine}:\n  --> ${line}`);
      }
    }
  }
}

console.log('Scanning for React Hook violations (hooks after early return)...');
scanDir('components');
scanDir('app');
scanDir('lib');
console.log('Scan completed.');
