$ErrorActionPreference = 'Stop'
$files = Get-ChildItem -Path $PWD -Filter '*.html' -File | Select-Object -ExpandProperty Name
$from = 'css/style.css?v=20261107'
$to   = 'css/style.css?v=20261112'
$count = 0
foreach ($f in $files) {
    $t = [System.IO.File]::ReadAllText((Join-Path $PWD $f))
    if ($t -notmatch [regex]::Escape($from)) { continue }
    $t = $t.Replace($from, $to)
    $u = [System.IO.File]::ReadAllText((Join-Path $PWD $f))
    if ($u -match [regex]::Escape($to)) {
        [System.IO.File]::WriteAllText((Join-Path $PWD $f), $u, (New-Object System.Text.UTF8Encoding $false))
        $count++
        Write-Output "updated $f"
    }
}
Write-Output "total updated: $count"
