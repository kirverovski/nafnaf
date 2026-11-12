$ErrorActionPreference = 'Stop'
$edge = 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
$out = Join-Path $PWD '_c/shots'
if (-not (Test-Path $out)) { $null = New-Item -ItemType Directory -Path $out }
$prof = Join-Path $env:TEMP ('edge-shot-' + [guid]::NewGuid().ToString('N').Substring(0,8))
$pages = @('adults.html','quests.html','admin.html')
foreach ($p in $pages) {
    $shot = Join-Path $out ('edge-' + $p.Replace('.html','') + '.png')
    $uri  = 'file:///' + ((Join-Path $PWD $p) -replace '\\','/')
    if (Test-Path $shot) { Remove-Item $shot -Force }
    $a = @('--headless','--disable-gpu','--no-sandbox','--no-first-run','--user-data-dir=' + $prof, '--virtual-time-budget=8000','--window-size=1400,2400','--screenshot=' + $shot, $uri)
    $proc = Start-Process -FilePath $edge -ArgumentList $a -Wait -PassThru -WindowStyle Hidden
    if (Test-Path $shot) { Write-Output ($p + ' exit=' + $proc.ExitCode + ' size=' + (Get-Item $shot).Length) }
    else { Write-Output ($p + ' exit=' + $proc.ExitCode + ' NO FILE') }
}
