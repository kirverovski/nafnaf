$ErrorActionPreference = 'Stop'
$chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
$out = Join-Path $PWD '_c/shots'
if (-not (Test-Path $out)) { $null = New-Item -ItemType Directory -Path $out }
$prof = Join-Path $env:TEMP ('chrome-shot-' + [guid]::NewGuid().ToString('N').Substring(0,8))
Write-Output ("running chrome processes: " + @(Get-Process chrome -ErrorAction SilentlyContinue).Count)
$pages = @('adults.html','admin.html')
foreach ($p in $pages) {
    $shot = Join-Path $out ('v2-' + $p.Replace('.html','') + '.png')
    $uri  = 'file:///' + ((Join-Path $PWD $p) -replace '\\','/')
    if (Test-Path $shot) { Remove-Item $shot -Force }
    $a = @('--headless=old','--disable-gpu','--no-sandbox','--no-first-run','--disable-extensions','--user-data-dir=' + $prof, '--virtual-time-budget=8000','--window-size=1400,2200','--screenshot=' + $shot, $uri)
    $proc = Start-Process -FilePath $chrome -ArgumentList $a -Wait -PassThru -WindowStyle Hidden
    Write-Output ($p + ' exit=' + $proc.ExitCode + ' exists=' + (Test-Path $shot))
    if (Test-Path $shot) { Write-Output ('  size=' + (Get-Item $shot).Length) }
}
