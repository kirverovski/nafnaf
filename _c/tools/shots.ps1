$ErrorActionPreference = 'Stop'
$chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
$out = Join-Path $PWD '_c/shots'
if (-not (Test-Path $out)) { $null = New-Item -ItemType Directory -Path $out }
$pages = @('adults.html','quests.html','shows.html','masters.html','decor.html','admin.html')
foreach ($p in $pages) {
    $shot = Join-Path $out ("after-" + $p.Replace('.html','') + ".png")
    $dom  = Join-Path $out ("dom-" + $p.Replace('.html','') + ".txt")
    $uri  = 'file:///' + ((Join-Path $PWD $p) -replace '\\','/')
    if (Test-Path $shot) { Remove-Item $shot -Force }
    $args1 = @('--headless=new','--disable-gpu','--hide-scrollbars','--no-sandbox','--virtual-time-budget=6000','--window-size=1400,2400','--screenshot=' + $shot, $uri)
    Start-Process -FilePath $chrome -ArgumentList $args1 -Wait -WindowStyle Hidden
    if ($p -eq 'adults.html') {
        $args2 = @('--headless=new','--disable-gpu','--dump-dom','--virtual-time-budget=4000', $uri)
        Start-Process -FilePath $chrome -ArgumentList $args2 -Wait -WindowStyle Hidden -RedirectStandardOutput $dom -NoNewWindow
    }
    if (Test-Path $shot) { Write-Output ("shot OK  $p  " + (Get-Item $shot).Length + ' bytes') } else { Write-Output "shot MISSING $p" }
}
$domFile = Join-Path $out 'dom-adults.txt'
if (Test-Path $domFile) {
    $d = [System.IO.File]::ReadAllText($domFile)
    Write-Output ("DOM adults: contact-modal-overlay=" + ([regex]::Matches($d, 'contact-modal-overlay')).Count + " openModal=" + ([regex]::Matches($d, 'id="openModal"')).Count + " bodyKidsAfterHero=" + ([regex]::Matches($d, 'after-hero-bg')).Count)
    # is modal still a descendant of body? check that </section> closed before modal
    Write-Output ("DOM size=" + $d.Length)
}
Write-Output done
