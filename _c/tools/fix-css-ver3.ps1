$ErrorActionPreference = 'Stop'
$enc = New-Object System.Text.UTF8Encoding $false
$from = 'css/style.css?v=20261107'
$to   = 'css/style.css?v=20261112'
$count = 0
foreach ($f in (Get-ChildItem -Path $PWD -Filter '*.html' -File)) {
    $t = [System.IO.File]::ReadAllText($f.FullName)
    if (-not $t.Contains($from)) { continue }
    $t2 = $t.Replace($from, $to)
    [System.IO.File]::WriteAllText($f.FullName, $t2, $enc)
    $count++
    Write-Output ("updated " + $f.Name + "  occurrences=" + ([regex]::Matches($t, [regex]::Escape($from))).Count)
}
Write-Output ("total updated files: $count")
Write-Output "--- verify ---"
foreach ($f in (Get-ChildItem -Path $PWD -Filter '*.html' -File)) {
    $t = [System.IO.File]::ReadAllText($f.FullName)
    $old = ([regex]::Matches($t, 'style\.css\?v=(\d{8})')).Groups
    $vers = @()
    foreach ($m in [regex]::Matches($t, 'style\.css\?v=(\d{8})')) { $vers += $m.Groups[1].Value }
    if ($vers.Count -gt 0) { Write-Output ("{0,-28} {1}" -f $f.Name, ($vers -join ',')) }
}
