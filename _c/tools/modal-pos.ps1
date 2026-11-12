$ErrorActionPreference = 'Stop'
$files = @('index.html','adults.html','animators.html','decor.html','kids1-6.html','kids10-15.html','kids6-10.html','masters.html','newyear.html','newyear-adler.html','quests.html','services.html','shows.html','ded-moroz-dagomyse.html')
Write-Output "head_end / body_start / header_start / contact-modal positions"
foreach ($f in $files) {
    if (-not (Test-Path (Join-Path $PWD $f))) { Write-Output "SKIP $f"; continue }
    $lines = [System.IO.File]::ReadAllLines((Join-Path $PWD $f))
    $headEnd = -1; $bodyStart = -1; $hdr = -1; $cm = @()
    for ($i = 0; $i -lt $lines.Count; $i++) {
        $l = $lines[$i]
        if ($headEnd -lt 0 -and $l -match '</head>') { $headEnd = $i }
        if ($bodyStart -lt 0 -and $l -match '<body[^>]*>') { $bodyStart = $i }
        if ($hdr -lt 0 -and $l -match '<header[\s>]') { $hdr = $i }
        if ($l -match '<div class="contact-modal-overlay">') { $cm += ($i + 1) }
    }
    $flag = ''
    foreach ($c in $cm) { if ($c - 1 -le $bodyStart) { $flag += ' [OUTSIDE-BODY!]' } }
    Write-Output ("{0,-24} head</={1} body<={2} header<={3} modal@{4}{5}" -f $f, ($headEnd + 1), ($bodyStart + 1), ($hdr + 1), ($cm -join ','), $flag)
}
