$ErrorActionPreference = 'Stop'
$files = Get-ChildItem -Path $PWD -Filter '*.html' -File | Select-Object -ExpandProperty Name
$from = 'css/style.css?v=20261107'
$to   = 'css/style.css?v=20261112'
$count = 0
foreach ($f in $files) {
    $p = Join-Path $PWD $f
    $t = [System.IO.File]::ReadAllText($p)
    if ($t -notcontains $from) { Write-Output "skip $f" ; continue }
    $t2 = $t.Replace($from, $to)
    if ($t2 -contains $to) {
        [System.IO.File]::WriteAllText($p, $t2, (New-Object System.Text.UTF8Encoding $false))
        $count++
        Write-Output "updated $f"
    } else {
        Write-Output "replace failed $f"
    }
}
Write-Output "total updated: $count"
