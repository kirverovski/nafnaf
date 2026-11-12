param([string]$Path, [string]$Filter = 'section|class="grid|pricing-section|seo-toggle|mobile-bottom-nav|<div class="modal"')
$text = [System.IO.File]::ReadAllText($Path)
$text = [regex]::Replace($text, '<script.*?</script>', '', 'Singleline')
$text = [regex]::Replace($text, '<!--.*?-->', '', 'Singleline')
$lines = $text -split "`r?`n"
$depth = 0
for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    $opens = ([regex]::Matches($line, '<(?:section|div)\b(?![^>]*\/>)')).Count
    $closes = ([regex]::Matches($line, '</(?:section|div)>')).Count
    if ($line -match $Filter -and $line.Trim()) {
        $t = $line.Trim()
        if ($t.Length -gt 62) { $t = $t.Substring(0, 62) }
        Write-Output ("d=" + $depth + " [" + ($i + 1) + "] " + $t)
    }
    $depth += $opens - $closes
}
Write-Output ("итоговая глубина: " + $depth)
