$ErrorActionPreference = 'Stop'
$chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
$out = Join-Path $PWD '_c/shots'
if (-not (Test-Path $out)) { $null = New-Item -ItemType Directory -Path $out }
$pages = @('adults.html','quests.html','shows.html','masters.html','decor.html','admin.html')
foreach ($p in $pages) {
    $shot = Join-Path $out ('after-' + $p.Replace('.html','') + '.png')
    $uri  = 'file:///' + ((Join-Path $PWD $p) -replace '\\','/')
    if (Test-Path $shot) { Remove-Item $shot -Force }
    $a = @('--headless','--disable-gpu','--no-sandbox','--virtual-time-budget=6000','--window-size=1400,2400','--screenshot=' + $shot, $uri)
    Write-Output ('launching: ' + $p)
    Start-Process -FilePath $chrome -ArgumentList $a -Wait -WindowStyle Hidden
    Start-Sleep -Seconds 2
    if (Test-Path $shot) { Write-Output ('shot OK  ' + $p + '  ' + (Get-Item $shot).Length + ' bytes') } else { Write-Output "shot MISSING $p" }
}
Write-Output done
