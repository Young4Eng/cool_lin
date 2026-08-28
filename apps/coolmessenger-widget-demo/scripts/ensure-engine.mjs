/**
 * 위젯을 돌리기 전에 규칙 엔진이 빌드돼 있는지 확인한다.
 *
 * packages/schedule-engine 은 TypeScript 라 dist/ 를 만들어야 위젯이 import 할 수 있는데,
 * dist/ 는 .gitignore 대상이다. 그래서 저장소를 새로 받은 사람은 dist/ 가 없고
 * "Could not resolve @cool-lin/schedule-engine/browser" 로 빌드가 깨진다.
 *
 * predev / prebuild 에서 이 파일을 돌려 그 상황을 없앤다.
 * 이미 최신이면 아무것도 하지 않으므로 평소에는 거의 시간이 들지 않는다.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const engine = path.resolve(here, "../../../packages/schedule-engine");
const dist = path.join(engine, "dist");
const src = path.join(engine, "src");

const run = (args) => {
  // Windows 에서 npm 은 .cmd 라서 shell 없이는 실행되지 않는다 (Node 20+ 보안 변경).
  execFileSync("npm", args, { cwd: engine, stdio: "inherit", shell: true });
};

/** 폴더 안에서 가장 나중에 고쳐진 시각 */
function newestMtime(dir) {
  let newest = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const mtime = entry.isDirectory() ? newestMtime(full) : statSync(full).mtimeMs;
    if (mtime > newest) newest = mtime;
  }
  return newest;
}

if (!existsSync(engine)) {
  console.error(`[schedule-engine] ${engine} 을 찾지 못했습니다. 저장소 전체를 받았는지 확인해 주세요.`);
  process.exit(1);
}

if (!existsSync(path.join(engine, "node_modules"))) {
  console.log("[schedule-engine] 의존성을 설치합니다...");
  run(["install"]);
}

const built = existsSync(path.join(dist, "browser.js"));
const stale = built && newestMtime(src) > newestMtime(dist);

if (!built) {
  console.log("[schedule-engine] 빌드된 결과가 없어 빌드합니다...");
  run(["run", "build"]);
} else if (stale) {
  console.log("[schedule-engine] 규칙이 바뀌어 다시 빌드합니다...");
  run(["run", "build"]);
}
