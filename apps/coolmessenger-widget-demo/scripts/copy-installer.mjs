/**
 * 방금 만든 설치파일을 저장소 맨 위로 복사한다.
 *
 *   node <이 경로>
 *
 * 산출물은 `src-tauri/target/release/bundle/nsis/` 안에 판 버전이 붙은 이름으로
 * 생긴다. 나눠 줄 때마다 그 깊이까지 들어가 찾기 번거로워, 저장소 맨 위에 늘 같은
 * 이름으로 한 벌 둔다. 사본이라 손으로 복사하면 잊기 쉬우므로 빌드 뒤에 이어 붙인다.
 *
 * 사본은 커밋하지 않는다 (.gitignore).
 */
import { copyFileSync, existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
// 이 파일은 위젯 앱 안에 있으므로 위치를 스스로 안다.
const app = path.resolve(here, "..");
const repo = path.resolve(app, "..", "..");
const nsis = path.join(app, "src-tauri", "target", "release", "bundle", "nsis");
const dest = path.join(repo, "쿨린위젯_설치.exe");

if (!existsSync(nsis)) {
  console.error("[설치파일] 만들어진 설치파일이 없습니다. `npm run tauri build` 를 먼저 돌리세요.");
  process.exit(1);
}

// 판을 올리면 예전 이름의 파일이 그대로 남는다. 가장 나중에 만들어진 것이 방금 것이다.
const built = readdirSync(nsis)
  .filter((name) => name.endsWith("-setup.exe"))
  .map((name) => path.join(nsis, name))
  .sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs);

if (built.length === 0) {
  console.error("[설치파일] nsis 폴더에 -setup.exe 가 없습니다. 빌드가 끝까지 갔는지 보세요.");
  process.exit(1);
}

copyFileSync(built[0], dest);
console.log(`[설치파일] ${path.basename(dest)} 로 복사했습니다 (${path.basename(built[0])}).`);
