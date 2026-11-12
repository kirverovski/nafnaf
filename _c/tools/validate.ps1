$ErrorActionPreference = 'Stop'
$files = @('adults.html','animators.html','decor.html','kids1-6.html','kids10-15.html','kids6-10.html','masters.html','newyear.html','quests.html','services.html','shows.html','ded-moroz-dagomyse.html','newyear-adler.html')
Write-Output "=== Баланс <section> vs </section> ==="
foreach ($f in $files) {
    if (-not (Test-Path (Join-Path $PWD $f))) { Write-Output "SKIP $f (not found)"; continue }
    $t = [System.IO.File]::ReadAllText((Join-Path $PWD $f))
    $op = ([regex]::Matches($t, '<section[^/]*>')).Count
    $cl = ([regex]::Matches($t, '</section>')).Count
    $d = $op - $cl
    $s = if ($d -eq 0) { "OK" } else { "MISMATCH" }
    Write-Output ("$f : open=$op close=$cl diff=$d [$s]")
}

Write-Output ""
Write-Output "=== Дубли id (с вырезанием комментариев) ==="
foreach ($f in $files) {
    if (-not (Test-Path (Join-Path $PWD $f))) { continue }
    $t = [System.IO.File]::ReadAllText((Join-Path $PWD $f))
    $lines = [System.Collections.Generic.List[string]]($t -split "`r?`n")
    $clean = @()
    foreach ($l in $lines) {
        $cleaned = $l -replace '<!--.*?-->', '' -replace '\s+', ' '
        $clean += $cleaned
    }
    $cleanText = $clean -join "`n"
    $matches = [regex]::Matches($cleanText, 'id="([^"]+)"')
    $ids = @{}
    $dups = @{}
    foreach ($m in $matches) {
        $id = $m.Groups[1].Value
        if ($ids.ContainsKey($id)) { $dups[$id] = $true } else { $ids[$id] = $true }
    }
    if ($dups.Count -gt 0) {
        Write-Output "  $f : " + ($dups.Keys -join ', ')
    }
}
Write-Output "готово"
