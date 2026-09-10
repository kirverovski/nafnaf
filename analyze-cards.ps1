$files = @("animators.html","masters.html","quests.html")
foreach($f in $files) {
    Write-Host "=== $f ==="
    $lines = Get-Content $f -Encoding utf8
    for($i = 0; $i -lt $lines.Count; $i++) {
        $line = $lines[$i]
        if($line -match 'data-price=') {
            $price = [regex]::Match($line,'data-price="([^"]*)"').Groups[1].Value
            $hasPill=$false; $hasButtons=$false; $buttonsLine=$null; $fadeLine=$null
            for($j=$i+1; $j -lt $lines.Count -and $j -le $i+70; $j++) {
                if($lines[$j] -match 'service-card-info-pill') { $hasPill=$true }
                if($lines[$j] -match 'service-card-buttons') { $hasButtons=$true; $buttonsLine=$j+1; break }
                if($lines[$j] -match '<p class="fade-in"' -and $fadeLine -eq $null) { $fadeLine=$j+1 }
            }
            $status = if($hasPill){"HAS PILL"}else{"*** MISSING PILL ***"}
            Write-Host "  price=[$price] data-price@L$($i+1) fade-in@L$fadeLine buttons@L$buttonsLine  $status"
        }
    }
}