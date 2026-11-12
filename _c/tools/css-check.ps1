$ErrorActionPreference = 'Stop'
$t = [System.IO.File]::ReadAllText((Join-Path $PWD 'css/style.css'))
$patterns = @('after-hero-bg', '\.categories', 'section section', 'section \.modal', '\.modal-overlay', '\.contact-modal-overlay', '\.mobile-bottom-nav', '\.seo-section-black')
foreach ($p in $patterns) {
    Write-Output ("{0,-24} => {1}" -f $p, ([regex]::Matches($t, $p)).Count)
}
Write-Output "--- rules mentioning .categories ---"
foreach ($m in [regex]::Matches($t, '[^{}]*\{[^}]*\}')) {
    if ($m.Value -match 'categories') { Write-Output ('  ' + $m.Value.Substring(0, [Math]::Min(180, $m.Value.Length))) }
}
Write-Output "--- any rule with section as ancestor of modal/nav ---"
foreach ($m in [regex]::Matches($t, '[^{}]*\{[^}]*\}')) {
    if ($m.Value -match '^\s*section' -or $m.Value -match '\bsection\s+[^\s{]*\b') { Write-Output ('  ' + $m.Value.Substring(0, [Math]::Min(180, $m.Value.Length))) }
}
