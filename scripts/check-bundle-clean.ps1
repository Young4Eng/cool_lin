# 만들어진 설치본에 들어가면 안 되는 것이 딸려 들어갔는지 본다.
#
# 한 번 배포하면 되돌릴 수 없는 종류의 실수라, 빌드가 끝난 뒤 반드시 한 번 확인한다.
# 막는 것:
#   - 실제 쿨메신저 내보내기 (coolmsg_*.xls) — 학생·교사 실명이 들어 있다 (PRD 22장)
#   - coolexcel/ 아래 원본
#   - CoolMessenger.exe — 목업 바이너리는 데모 키트로 따로 나눠 준다
#   - pii.key / pii-map.json — 이 PC 의 로컬 열쇠와 암호문
#
# 리소스 폴더를 본다. NSIS exe 안을 뜯어보는 대신 Tauri 가 리소스를 모아 두는
# `target/release/` 를 보면 무엇이 담겼는지 그대로 드러난다.

$ErrorActionPreference = "Stop"

$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
$Release = Join-Path $Root "apps\coolmessenger-widget-demo\src-tauri\target\release"

if (-not (Test-Path $Release)) {
    throw "빌드 결과 폴더가 없습니다: $Release"
}

# 리소스로 들어가는 곳만 본다. target/release 전체에는 빌드 중간 산물이 잔뜩 있다.
$Scan = @(
    (Join-Path $Release "python"),
    (Join-Path $Release "resources")
) | Where-Object { Test-Path $_ }

$Bad = @()
foreach ($dir in $Scan) {
    $Bad += Get-ChildItem -Path $dir -Recurse -File -ErrorAction SilentlyContinue | Where-Object {
        $_.Name -like "coolmsg_*.xls" -or
        $_.Extension -in @(".xls", ".xlsx") -or
        $_.Name -eq "CoolMessenger.exe" -or
        $_.Name -eq "pii.key" -or
        $_.Name -eq "pii-map.json"
    }
}

if ($Bad.Count -gt 0) {
    Write-Host "설치본에 들어가면 안 되는 파일이 있습니다:" -ForegroundColor Red
    $Bad | ForEach-Object { Write-Host "  $($_.FullName)" }
    throw "개인정보나 목업 바이너리가 설치본에 섞였습니다. 배포하지 마세요."
}

# 반대로, 있어야 할 것이 빠지지 않았는지도 본다. 없으면 교실 PC 에서 «가져오기»가
# 파이썬을 못 찾아 죽는다 — 그건 설치해 보기 전에는 드러나지 않는다.
$Need = @("python\ingest.py", "python\automator.py", "python\parser.py", "python\python.exe")
$Missing = $Need | Where-Object { -not (Test-Path (Join-Path $Release $_)) }
if ($Missing.Count -gt 0) {
    Write-Host "설치본에 있어야 할 파일이 빠졌습니다:" -ForegroundColor Red
    $Missing | ForEach-Object { Write-Host "  $_" }
    throw "번들이 불완전합니다."
}

Write-Host "설치본 점검 통과: 개인정보 없음, 파이썬 런타임 포함" -ForegroundColor Green
