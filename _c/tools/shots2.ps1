$ErrorActionPreference = 'Stop'
$chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
$out = Join-Path $PWD '_c/shots'
if (-not (Test-Path $out)) { $null = New-Item -ItemType Directory -Path $out }
$pages = @('adults.html','quests.html','shows.html','masters.html','decor.html','admin.html')
foreach ($p in $pages) {
    $shot = Join-Path $out ('after-' + $p.Replace('.html','') + '.png')
    $uri  = 'file:///' + ((Join-Path $PWD $p) -replace '\\','/')
    if (Test-Path $shot) { Remove-Item $shot -Force }
    $a = @('--headless=new','--disable-gpu','--hide-scrollbars','--no-sandbox','--virtual-time-budget=6000','--window-size=1400,2400','--screenshot=' + $shot, $uri)
    Start-Process -FilePath $chrome -ArgumentList $a -Wait -WindowStyle Hidden
    if (Test-Path $shot) { Write-Output ('shot OK  ' + $p + '  ' + (Get-Item $shot).Length) } else { Write-Output "shot MISSING $p" }
}
$domFile = Join-Path $out 'dom-adults.txt'
$a2 = @('--headless=new','--disable-gpu','--dump-dom','--virtual-time-budget=4000', ('file:///' + ((Join-Path $PWD 'adults.html') -replace '\\','/')))
Start-Process -FilePath $chrome -ArgumentList $a2 -Wait -WindowStyle Hidden -RedirectStandardOutput $domFile
if (Test-Path $domFile) {
    $d = [System.IO.File]::ReadAllText($domFile)
    Write-Output ('DOM adults: contact-modal-overlay=' + ([regex]::Matches($d, 'contact-modal-overlay')).Count + ' openModal=' + ([regex]::Matches($d, 'id="openModal"')).Count + ' after-hero-bg=' + ([regex]::Matches($d, 'after-hero-bg')).Count)
    # where does the modal live in the parsed DOM? look at the text right before it
    $idx = $d.IndexOf('contact-modal-overlay')
    if ($idx -gt 400) { Write-Output ('context before modal: ...' + $d.Substring([Math]::Max(0,$idx-260), 260).Replace("`n",' ').Replace("`r",' ')) }
}
Write-Output done
