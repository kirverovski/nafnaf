$ErrorActionPreference = 'Stop'
$utf8NoBom = New-Object System.Text.UTF8Encoding $false

function Read-Nl([string]$t) { if ($t -match "`r`n") { return "`r`n" } else { return "`n" } }

$targets = 'adults.html','animators.html','decor.html','kids1-6.html','kids10-15.html','kids6-10.html','masters.html','quests.html','services.html','shows.html'

Write-Output "--- 1. закрытие after-hero-bg ---"
foreach ($n in $targets) {
    $text = [System.IO.File]::ReadAllText((Join-Path $PWD $n))
    $nl = Read-Nl $text
    $lines = [System.Collections.Generic.List[string]]($text -split "`r?`n")

    $last = -1
    for ($i = 0; $i -lt $lines.Count; $i++) { if ($lines[$i] -match '^\s*</section>\s*$') { $last = $i } }
    if ($last -lt 0) { throw "$n : не найдено </section>" }
    if ($last + 1 -lt $lines.Count -and $lines[$last + 1] -match '^\s*</section>\s*$') {
        Write-Output ("  $n : уже закрыто, пропуск"); continue
    }
    $lines.Insert($last + 1, '</section>')
    [System.IO.File]::WriteAllLines((Join-Path $PWD $n), $lines, $utf8NoBom)
    Write-Output ("  $n : </section> вставлен после строки " + ($last + 1))
}

Write-Output "--- 2. удаление мёртвого дубля модалки связи в adults.html ---"
$text = [System.IO.File]::ReadAllText((Join-Path $PWD 'adults.html'))
$lines = [System.Collections.Generic.List[string]]($text -split "`r?`n")
$hits = @(); for ($i = 0; $i -lt $lines.Count; $i++) { if ($lines[$i] -match '<!-- Модальное окно связи -->') { $hits += $i } }
if ($hits.Count -ne 2) { throw "ожидалось 2 вхождения, найдено $($hits.Count)" }
$start = $hits[1]
if ($lines[$start - 1].Trim() -eq '') { $start-- }
$end = -1
for ($i = $hits[1] + 1; $i -lt $lines.Count; $i++) { if ($lines[$i] -match '^</div>\s*$') { $end = $i; break } }
if ($end -lt 0) { throw 'не найден конец дублированного блока' }
$lines.RemoveRange($start, $end - $start + 1)
[System.IO.File]::WriteAllLines((Join-Path $PWD 'adults.html'), $lines, $utf8NoBom)
Write-Output ("  adults.html : удалены строки " + ($start + 1) + ".." + ($end + 1))

Write-Output "--- 3. admin.html: id=efoot -> class=efoot ---"
$a = [System.IO.File]::ReadAllText((Join-Path $PWD 'admin.html'))
$before = ([regex]::Matches($a, 'id="efoot"')).Count
$a = $a.Replace('<div id="efoot">', '<div class="efoot">')
$a = $a.Replace('#efoot{', '.efoot{').Replace('#efoot .btn', '.efoot .btn')
[System.IO.File]::WriteAllText((Join-Path $PWD 'admin.html'), $a, $utf8NoBom)
Write-Output ("  id=efoot было: $before | стало id: " + ([regex]::Matches($a, 'id="efoot"')).Count + " | class=efoot: " + ([regex]::Matches($a, 'class="efoot"')).Count + " | CSS .efoot: " + ([regex]::Matches($a, '\.efoot\{|\.efoot \.btn')).Count)
Write-Output "готово"
