# Bundle Windows embeddable CPython 3.12 x64 + pillow/numpy/opencv-python
# into src-tauri/resources/python-runtime so the NSIS installer can run ingest.py
# on classroom PCs that have Cool Messenger only (no system Python / Node / pip).
#
# Does NOT install Ollama or a model.
# Does NOT copy CoolMessenger.exe or real message xls files.

$ErrorActionPreference = "Stop"

$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
$Dest = Join-Path $Root "apps\coolmessenger-widget-demo\src-tauri\resources\python-runtime"
$Req = Join-Path $Root "server\python\requirements.txt"
$PyVer = "3.12.10"
$ZipName = "python-$PyVer-embed-amd64.zip"
$Url = "https://www.python.org/ftp/python/$PyVer/$ZipName"

New-Item -ItemType Directory -Force -Path $Dest | Out-Null

Write-Host "Downloading $Url"
$ZipPath = Join-Path $env:TEMP $ZipName
Invoke-WebRequest -Uri $Url -OutFile $ZipPath -UseBasicParsing

Write-Host "Extracting to $Dest"
Expand-Archive -Path $ZipPath -DestinationPath $Dest -Force

$Pth = Get-ChildItem -Path $Dest -Filter "python*._pth" | Select-Object -First 1
if (-not $Pth) {
    throw "embed python ._pth not found in $Dest"
}
$StdlibZip = Get-ChildItem -Path $Dest -Filter "python3*.zip" | Select-Object -First 1
if (-not $StdlibZip) {
    throw "embed python stdlib zip not found in $Dest"
}

# Enable site so pip packages (pillow, numpy, opencv-python) import.
$PthBody = @"
$($StdlibZip.Name)
.
Lib\site-packages
import site
"@
Set-Content -Path $Pth.FullName -Value $PthBody -Encoding ascii

$Py = Join-Path $Dest "python.exe"
if (-not (Test-Path $Py)) {
    throw "python.exe missing after extract"
}

Write-Host "Installing pip into embeddable CPython"
$GetPip = Join-Path $Dest "get-pip.py"
Invoke-WebRequest -Uri "https://bootstrap.pypa.io/get-pip.py" -OutFile $GetPip -UseBasicParsing
& $Py $GetPip --no-warn-script-location
if ($LASTEXITCODE -ne 0) {
    throw "get-pip.py failed"
}

if (-not (Test-Path $Req)) {
    throw "requirements.txt missing: $Req"
}

Write-Host "pip install -r server/python/requirements.txt (no Ollama)"
& $Py -m pip install --no-warn-script-location --disable-pip-version-check -r $Req
if ($LASTEXITCODE -ne 0) {
    throw "pip install failed"
}

Write-Host "Verify imports"
& $Py -c "import PIL, numpy, cv2; print('embed-ok', cv2.__version__)"
if ($LASTEXITCODE -ne 0) {
    throw "import check failed"
}


Remove-Item -Force -ErrorAction SilentlyContinue $GetPip

Write-Host "Bundled embeddable CPython at $Dest"
