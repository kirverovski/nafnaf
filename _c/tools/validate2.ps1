$ErrorActionPreference = 'Stop'
$files = @('adults.html','animators.html','decor.html','kids1-6.html','kids10-15.html','kids6-10.html','masters.html','newyear.html','quests.html','services.html','shows.html','ded-moroz-dagomyse.html','newyear-adler.html','index.html','admin.html')
Write-Output "=== section balance ==="
foreach ($f in $files) {
    $p = Join-Path $PWD $f
    if (-not (Test-Path $p)) { Write-Output "SKIP $f"; continue }
    $t = [System.IO.File]::ReadAllText($p)
    $t = [regex]::Replace($t, '<!--.*?-->', '', 'Singleline')
    $op = ([regex]::Matches($t, '<section[\s>]')).Count
    $cl = ([regex]::Matches($t, '</section>')).Count
    $dv = ([regex]::Matches($t, '<div[\s>]')).Count - ([regex]::Matches($t, '</div>')).Count
    $st = if ($op -eq $cl) { 'OK' } else { 'MISMATCH' }
    Write-Output ("{0,-24} section {1}/{2} diff={3} [{4}]  div_diff={5}" -f $f, $op, $cl, ($op - $cl), $st, $dv)
}

Write-Output ""
Write-Output "=== duplicate ids (comments stripped) ==="
$found = 0
foreach ($f in $files) {
    $p = Join-Path $PWD $f
    if (-not (Test-Path $p)) { continue }
    $t = [System.IO.File]::ReadAllText($p)
    $t = [regex]::Replace($t, '<!--.*?-->', '', 'Singleline')
    $seen = @{}; $dups = @()
    foreach ($m in [regex]::Matches($t, 'id="([^"]+)"')) {
        $id = $m.Groups[1].Value
        if ($seen.ContainsKey($id)) { if ($dups -notcontains $id) { $dups += $id } } else { $seen[$id] = $true }
    }
    if ($dups.Count -gt 0) { $found++; Write-Output ("  $f : " + ($dups -join ', ')) }
}
if ($found -eq 0) { Write-Output "  none" }

Write-Output ""
Write-Output "=== JSON-LD parse + BOM check ==="
foreach ($f in $files) {
    $p = Join-Path $PWD $f
    if (-not (Test-Path $p)) { continue }
    $bytes = [System.IO.File]::ReadAllBytes($p)
    $bom = if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) { 'BOM!' } else { 'no-bom' }
    $t = [System.IO.File]::ReadAllText($p)
    $bad = 0; $n = 0
    foreach ($m in [regex]::Matches($t, '(?s)<script[^>]*application/ld\+json[^>]*>(.*?)</script>')) {
        $n++
        try { $null = $m.Groups[1].Value | ConvertFrom-Json } catch { $bad++ }
    }
    Write-Output ("{0,-24} {1}  jsonld={2} bad={3}" -f $f, $bom, $n, $bad)
}
Write-Output "done"
