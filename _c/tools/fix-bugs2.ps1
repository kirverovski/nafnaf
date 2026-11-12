$ErrorActionPreference = 'Stop'
$utf8NoBom = New-Object System.Text.UTF8Encoding $false

Write-Output "--- 2. remove dead duplicate contact modal in adults.html ---"
$text = [System.IO.File]::ReadAllText((Join-Path $PWD 'adults.html'))
$lines = [System.Collections.Generic.List[string]]($text -split "`r?`n")
$hits = @()
for ($i = 0; $i -lt $lines.Count; $i++) { if ($lines[$i] -match '<div class="contact-modal-overlay">') { $hits += $i } }
Write-Output ("  contact-modal-overlay count: " + $hits.Count + " at lines " + ($hits | ForEach-Object { $_ + 1 }) -join ',')
if ($hits.Count -ne 2) { throw "expected 2 blocks" }
$second = $hits[1]
$start = $second
if ($lines[$start - 1] -match '<!--' -or $lines[$start - 1].Trim() -eq '') { }
if ($lines[$start - 1] -match '<!--') { $start = $start - 1 }
if ($lines[$start - 1].Trim() -eq '') { $start = $start - 1 }
$end = -1
for ($i = $second + 1; $i -lt $lines.Count; $i++) { if ($lines[$i] -match '^</div>\s*$') { $end = $i; break } }
if ($end -lt 0) { throw 'block end not found' }
Write-Output ("  removing lines " + ($start + 1) + ".." + ($end + 1))
Write-Output ("  first removed: " + $lines[$start])
Write-Output ("  last removed : " + $lines[$end])
$lines.RemoveRange($start, $end - $start + 1)
[System.IO.File]::WriteAllLines((Join-Path $PWD 'adults.html'), $lines, $utf8NoBom)
$check = ([System.IO.File]::ReadAllText((Join-Path $PWD 'adults.html')))
Write-Output ("  now contact-modal-overlay: " + ([regex]::Matches($check, '<div class="contact-modal-overlay">')).Count)

Write-Output "--- 3. admin.html id=efoot -> class=efoot ---"
$a = [System.IO.File]::ReadAllText((Join-Path $PWD 'admin.html'))
$before = ([regex]::Matches($a, 'id="efoot"')).Count
$a = $a.Replace('<div id="efoot">', '<div class="efoot">')
$a = $a.Replace('#efoot{', '.efoot{').Replace('#efoot .btn', '.efoot .btn')
[System.IO.File]::WriteAllText((Join-Path $PWD 'admin.html'), $a, $utf8NoBom)
Write-Output ("  before id=efoot: $before | after id: " + ([regex]::Matches($a, 'id="efoot"')).Count + " | class=efoot: " + ([regex]::Matches($a, 'class="efoot"')).Count + " | css rules: " + ([regex]::Matches($a, '\.efoot\{|\.efoot \.btn')).Count)
Write-Output "done"
