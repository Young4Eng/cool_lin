/**
 * 이 엔진을 쓰는 쪽에서 «빌드돼 있는지» 확인할 때 부르는 스크립트.
 *
 *   node <이 경로> 
 *
 * 엔진은 TypeScript 라 dist/ 를 만들어야 다른 패키지가 import 할 수 있는데
 * dist/ 는 .gitignore 대상이다. 그래서 저장소를 새로 받은 사람은 dist/ 가 없고
 * "Could not resolve @cool-lin/schedule-engine" 으로 빌드가 깨진다.
 *
 * 위젯과 서버의 predev / prebuild 가 이 파일을 돌려 그 상황을 없앤다.
 * 이미 최신이면 아무것도 하지 않으므로 평소에는 거의 시간이 들지 않는다.
 */
import { execSync } from "node:child_process";
import { existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
// 이 파일은 엔진 패키지 안에 있으므로 위치를 스스로 안다.
const engine = path.resolve(here, "..");
const dist = path.join(engine, "dist");
const src = path.join(engine, "src");

// Windows 에서 npm 은 .cmd 라 셸을 거쳐야 실행된다. 명령은 아래 두 개로 고정돼 있고
// 바깥 입력이 섞이지 않으므로 문자열로 넘겨도 안전하다.
const run = (command) => {
  execSync(`npm ${command}`, { cwd: engine, stdio: "inherit" });
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

if (!existsSync(path.join(engine, "node_modules"))) {
  console.log("[schedule-engine] 의존성을 설치합니다...");
  run("install");
}

const built = existsSync(path.join(dist, "browser.js"));
const stale = built && newestMtime(src) > newestMtime(dist);

if (!built) {
  console.log("[schedule-engine] 빌드된 결과가 없어 빌드합니다...");
  run("run build");
} else if (stale) {
  console.log("[schedule-engine] 규칙이 바뀌어 다시 빌드합니다...");
  run("run build");
}
