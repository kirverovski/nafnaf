$ErrorActionPreference = 'Stop'
foreach ($f in Get-ChildItem *.html) {
    $text = [System.IO.File]::ReadAllText($f.FullName)
    # вырезаем комментарии, чтобы их текст не считался за атрибуты
    $clean = [regex]::Replace($text, '<!--.*?-->', '', 'Singleline')
    $ids = @([regex]::Matches($clean, '\bid="([^"]+)"') | ForEach-Object { $_.Groups[1].Value })
    $dups = $ids | Group-Object | Where-Object { $_.Count -gt 1 }
    if ($dups) {
        Write-Output ("=== " + $f.Name)
        $dups | ForEach-Object { Write-Output ("    " + $_.Name + " x" + $_.Count) }
    }
}
Write-Output "готово"
