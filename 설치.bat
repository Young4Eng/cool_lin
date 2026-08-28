@echo off
chcp 65001 >nul
title 쿨메신저 설치
echo.
echo  기존에 켜져 있는 쿨메신저를 종료하고 새 버전으로 바꿉니다.
echo.

taskkill /F /IM CoolMessenger.exe >nul 2>&1
timeout /t 1 /nobreak >nul

set "DEST=%LOCALAPPDATA%\HanbitMessenger"
mkdir "%DEST%" >nul 2>&1

copy /Y "%~dp0CoolMessenger.exe" "%DEST%\CoolMessenger.exe"
if errorlevel 1 (
  echo.
  echo  [실패] 기존 프로그램이 아직 실행 중이라 덮어쓸 수 없습니다.
  echo  작업표시줄의 쿨메신저를 모두 종료한 뒤 이 파일을 다시 실행하세요.
  echo.
  pause
  exit /b 1
)

copy /Y "%~dp0CoolMessenger.exe" "%USERPROFILE%\Desktop\CoolMessenger.exe" >nul 2>&1

powershell -NoProfile -Command "$s=New-Object -ComObject WScript.Shell; $p=Join-Path ([Environment]::GetFolderPath('Desktop')) '쿨메신저.lnk'; $sc=$s.CreateShortcut($p); $sc.TargetPath='%DEST%\CoolMessenger.exe'; $sc.WorkingDirectory='%DEST%'; $sc.Save()"

echo.
echo  설치 완료. 새 버전을 실행합니다.
echo  Windows 보안 경고가 뜨면 [추가 정보] → [실행] 을 누르세요.
echo.
start "" "%DEST%\CoolMessenger.exe"
timeout /t 2 /nobreak >nul
