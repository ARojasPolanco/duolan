import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const huskyBin = join(root, 'node_modules', 'husky', 'bin.js');

if (!existsSync(join(root, '.git')) || !existsSync(huskyBin) || process.env.HUSKY === '0') {
  process.exit(0);
}

execFileSync(process.execPath, [huskyBin], { cwd: root, stdio: 'inherit' });
