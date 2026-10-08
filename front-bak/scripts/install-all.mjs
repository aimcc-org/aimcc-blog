import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const workspaceRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const requiredMajor = 26;
const currentMajor = Number(process.versions.node.split('.')[0]);
const pnpm = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
const localRush = resolve(workspaceRoot, 'node_modules/@microsoft/rush/bin/rush');

function run(command, args) {
  return new Promise((resolveRun, reject) => {
    const child = spawn(command, args, {
      cwd: workspaceRoot,
      stdio: 'inherit',
      env: process.env,
    });

    child.on('exit', (code) => {
      if (code === 0) resolveRun();
      else reject(new Error(`${command} ${args.join(' ')} exited with ${code}`));
    });
  });
}

if (currentMajor !== requiredMajor) {
  console.error(`需要 Node ${requiredMajor}.x。当前版本是 ${process.version}。`);
  console.error('请在仓库根目录或 front/ 下执行：nvm install && nvm use');
  process.exit(1);
}

console.log('[install-all] 安装 front 工作区根依赖');
await run(pnpm, ['install']);

if (!existsSync(localRush)) {
  console.error('[install-all] 未找到本地 Rush，请检查 pnpm install 是否成功。');
  process.exit(1);
}

console.log('[install-all] 使用本地 Rush 安装所有项目依赖');
await run(process.execPath, [localRush, 'update']);

console.log('[install-all] 完成');
