import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { profiles, profileNames } from '../profiles.config.mjs';

const profileName = process.argv[2] ?? 'main';

if (!profiles[profileName]) {
  console.error(`Unknown profile "${profileName}". Expected one of: ${profileNames.join(', ')}`);
  process.exit(1);
}

const frontDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(frontDir, 'dist', profileName);
const pnpm = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';

function run(args, env = process.env) {
  return new Promise((resolve, reject) => {
    const child = spawn(pnpm, args, {
      cwd: frontDir,
      stdio: 'inherit',
      env,
    });
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${pnpm} ${args.join(' ')} exited with ${code}`));
    });
  });
}

console.log(`[build] profile=${profileName}`);
await run(['exec', 'astro', 'build'], { ...process.env, SITE_PROFILE: profileName });
await run(['exec', 'pagefind', '--site', outDir]);
console.log(`[build] done -> ${outDir}`);
