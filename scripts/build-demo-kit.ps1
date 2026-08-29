# 나눠 줄 데모 키트 한 벌을 `demo-kit/out/` 에 모은다.
#
#   설치본 + 설치 순서 한 장 + (있으면) 목업 쿨메신저 + 합성 씨앗 xls
#
# 씨앗 xls 가 들어가는 이유: 메신저를 못 깔았거나 네트워크가 없는 PC 에서도 위젯이
# 일정을 보여 줘야 하기 때문이다. 셸이 바탕화면의 `coolmsg_*.xls` 를 읽으므로,
# 그 파일 하나만 바탕화면에 두면 「가져오기」 없이도 화면이 찬다.
#
# 씨앗은 `packages/schedule-engine/fixtures/golden.json` 의 **합성** 쪽지다.
# `coolexcel/` 의 실제 내보내기는 절대 넣지 않는다 (PRD 22장).

$ErrorActionPreference = "Stop"

$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
$Out = Join-Path $Root "demo-kit\out"
$Nsis = Join-Path $Root "apps\coolmessenger-widget-demo\src-tauri\target\release\bundle\nsis"

if (Test-Path $Out) { Remove-Item -Recurse -Force $Out }
New-Item -ItemType Directory -Force -Path $Out | Out-Null

# 1. 설치본
$Installer = Get-ChildItem -Path $Nsis -Filter "*.exe" -ErrorAction SilentlyContinue |
    Sort-Object LastWriteTime -Descending | Select-Object -First 1
if (-not $Installer) {
    throw "설치본을 찾지 못했습니다: $Nsis`n먼저 `npx tauri build --bundles nsis` 를 돌리세요."
}
Copy-Item $Installer.FullName (Join-Path $Out "쿨린위젯_설치.exe")
Write-Host "설치본: $($Installer.Name) ($([math]::Round($Installer.Length/1MB,1)) MB)"

# 2. 설치 순서 한 장
Copy-Item (Join-Path $Root "docs\설치순서.md") $Out

# 3. 목업 쿨메신저 — 저장소에 있을 때만. 바이너리는 커밋하지 않으므로 없을 수 있다.
$Mock = Join-Path $Root "CoolMessenger.exe"
if (Test-Path $Mock) {
    Copy-Item $Mock $Out
    foreach ($f in @("설치.bat", "사용설명.txt")) {
        $src = Join-Path $Root $f
        if (Test-Path $src) { Copy-Item $src $Out }
    }
    Write-Host "목업 쿨메신저 포함"
} else {
    Write-Host "목업 쿨메신저 없음 — 설치본만 넣습니다 (CoolMessenger.exe 는 gitignore 대상)"
}

# 4. 합성 씨앗 xls
& node (Join-Path $Root "scripts\make-seed-xls.mjs") --out $Out
if ($LASTEXITCODE -ne 0) { throw "씨앗 xls 를 만들지 못했습니다." }

# 5. 실제 데이터가 섞여 들어가지 않았는지 마지막으로 본다.
#    씨앗 하나 말고 다른 xls 가 있으면 어딘가에서 실제 내보내기가 딸려 온 것이다.
$xls = @(Get-ChildItem -Path $Out -Filter "*.xls" -File)
if ($xls.Count -ne 1) {
    throw "키트 안의 xls 가 $($xls.Count) 개입니다. 씨앗 하나만 있어야 합니다 — 실제 쪽지가 섞였는지 확인하세요."
}

Write-Host ""
Write-Host "데모 키트: $Out" -ForegroundColor Green
Get-ChildItem $Out | ForEach-Object { Write-Host ("  {0,-28} {1,8:N0} KB" -f $_.Name, ($_.Length / 1KB)) }
Write-Host ""
Write-Host "쓰는 법: 이 폴더를 통째로 압축해 나눠 주고, 받은 쪽은"
Write-Host "  1) 쿨린위젯_설치.exe 실행"
Write-Host "  2) coolmsg_*.xls 를 바탕화면에 둔다 (메신저 없이 볼 때)"
Write-Host "  3) 설치순서.md 를 따른다"
