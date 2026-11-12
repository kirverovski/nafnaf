$ErrorActionPreference = 'Stop'
$t = [System.IO.File]::ReadAllText((Join-Path $PWD 'css/style.css'))
$patterns = @('after-hero-bg', '\.categories', 'section section', 'section \.modal', '\.modal-overlay', '\.contact-modal-overlay', '\.mobile-bottom-nav', '\.seo-section-black')
foreach ($p in $patterns) {
    Write-Output ("{0,-24} => {1}" -f $p, ([regex]::Matches($t, $p)).Count)
}
Write-Output "--- rules with 'categories' selector ---"
$rules = $t -split '\}(?=[^{}]*\{)'
foreach ($r in $rules) {
    if ($r -match 'categories') {
        Write-Output ("  " + $r.Substring(0, [Math]::Min(200, $r.Length)).Trim())
    }
}
Write-Output "--- rules with 'section' as selector/ancestor ---"
$secRules = 0
foreach ($r in $rules) {
    if ($r -match '^\s*section' -or $r -match 'section\s+[^\s{,]+') {
        if ($secRules -lt 10) {
            Write-Output ("  " + $r.Substring(0, [Math]::Min(200, $r.Length)).Trim())
            $secRules++
        }
    }
}
