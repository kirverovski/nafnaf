param([string]$Path)
$text = [System.IO.File]::ReadAllText($Path)
$lines = $text -split "`r?`n"
$stack = [System.Collections.ArrayList]::new()
for ($i = 0; $i -lt $lines.Count; $i++) {
    foreach ($m in [regex]::Matches($lines[$i], '</?section\b[^>]*>')) {
        if ($m.Value.StartsWith('</')) {
            if ($stack.Count -gt 0) { [void]$stack.RemoveAt($stack.Count - 1) }
            else { Write-Output ("  ЛИШНИЙ </section> на строке " + ($i + 1)) }
        } else {
            $cls = ([regex]::Match($m.Value, 'class="([^"]*)"')).Groups[1].Value
            [void]$stack.Add([pscustomobject]@{ Line = $i + 1; Cls = $cls })
        }
    }
}
foreach ($s in $stack) { Write-Output ("  NOT CLOSED line " + $s.Line + " class=" + $s.Cls) }
if ($stack.Count -eq 0) { Write-Output "  balanced" }
