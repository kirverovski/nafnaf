# Генератор YML-фида Яндекс Вебмастера в формате «Исполнители» (услуги).
# Читает исходный yandex_market.xml, берёт из него услуги и формирует
# корректный фид: сеты <sets>, исполнителя в <name>, обязательные <param>.
# Запуск:  powershell -ExecutionPolicy Bypass -File gen-feed.ps1

$ErrorActionPreference = 'Stop'
$src = Join-Path $PSScriptRoot 'yandex_market.xml'

function Esc([string]$s) {
    $s = $s -replace '&', '&amp;' -replace '<', '&lt;' -replace '>', '&gt;'
    return $s
}

function Clean([string]$s) {
    $s = $s -replace '\s*\r?\n\s*', ' '
    return $s.Trim()
}

$x = [xml](Get-Content $src -Raw -Encoding UTF8)
$shop = $x.yml_catalog.shop
$offers = @($shop.offers.offer)
if ($offers.Count -lt 1) { throw 'Нет offers' }

# Сеты: один на страницу сайта (URL сета = URL сниппета в поиске)
$sets = [ordered]@{
    'services.html'  = 'Услуги для праздника'
    'animators.html' = 'Аниматоры'
    'shows.html'     = 'Шоу-программы'
    'masters.html'   = 'Мастер-классы'
    'quests.html'    = 'Квесты'
    'decor.html'     = 'Декор и фотозоны'
}

# Уникальные картинки (у одного offer своя ссылка)
$picFix = @{
    '112' = 'https://nafnafiki.ru/images/service-video-2.webp'
    '113' = 'https://nafnafiki.ru/images/addons-2.webp'
    '315' = 'https://nafnafiki.ru/images/karaoke-2.webp'
}

# Обязательные параметры фида «Исполнители»
$rating  = '5.0'   # Рейтинг
$reviews = '50'    # Число отзывов
$exp     = '10'    # Годы опыта
$region  = 'Сочи'  # Регион
$conv    = '1'     # Конверсия (произвольное число, больше = лучше)

$execName = 'NAF NAFIKI'

$sb = New-Object System.Text.StringBuilder
[void]$sb.AppendLine('<?xml version="1.0" encoding="UTF-8"?>')
[void]$sb.AppendLine('<yml_catalog date="' + (Get-Date -Format 'yyyy-MM-dd HH:mm') + '">')
[void]$sb.AppendLine('    <shop>')
[void]$sb.AppendLine('        <name>' + (Esc $shop.name) + '</name>')
[void]$sb.AppendLine('        <company>' + (Esc $shop.company) + '</company>')
[void]$sb.AppendLine('        <url>' + (Esc $shop.url) + '</url>')
[void]$sb.AppendLine('        <email>' + (Esc $shop.email) + '</email>')
[void]$sb.AppendLine('        <phone>' + (Esc $shop.phone) + '</phone>')
[void]$sb.AppendLine('')
[void]$sb.AppendLine('        <currencies>')
[void]$sb.AppendLine('            <currency id="RUR" rate="1"/>')
[void]$sb.AppendLine('        </currencies>')
[void]$sb.AppendLine('        <categories>')
foreach ($c in @($shop.categories.category)) {
    [void]$sb.AppendLine('            <category id="' + $c.id + '">' + (Esc $c.'#text') + '</category>')
}
[void]$sb.AppendLine('        </categories>')
[void]$sb.AppendLine('')
[void]$sb.AppendLine('        <sets>')
foreach ($k in $sets.Keys) {
    [void]$sb.AppendLine('            <set id="' + $k.Replace('.html', '') + '">')
    [void]$sb.AppendLine('                <name>' + (Esc $execName) + '</name>')
    [void]$sb.AppendLine('                <url>https://nafnafiki.ru/' + $k + '</url>')
    [void]$sb.AppendLine('            </set>')
}
[void]$sb.AppendLine('        </sets>')
[void]$sb.AppendLine('')
[void]$sb.AppendLine('        <offers>')

foreach ($o in $offers) {
    $page = ($o.url -replace 'https://nafnafiki.ru/', '') -replace '#.*$', ''
    if (-not $sets.Contains($page)) { throw "Неизвестная страница: $($o.url)" }
    $setId = $page.Replace('.html', '')

    $title = Clean $o.name
    $desc = Clean $o.description
    if ($title) { $desc = $title + '. ' + $desc }

    $pic = $o.picture
    if ($picFix.ContainsKey([string]$o.id)) { $pic = $picFix[[string]$o.id] }

    [void]$sb.AppendLine('            <offer id="' + $o.id + '">')
    # Исполнитель услуги — обязательное требование Яндекса
    [void]$sb.AppendLine('                <name>' + (Esc $execName) + '</name>')
    [void]$sb.AppendLine('                <url>' + (Esc $o.url) + '</url>')
    [void]$sb.AppendLine('                <price>' + $o.price + '</price>')
    [void]$sb.AppendLine('                <currencyId>' + $o.currencyId + '</currencyId>')
    [void]$sb.AppendLine('                <categoryId>' + $o.categoryId + '</categoryId>')
    [void]$sb.AppendLine('                <set-ids>' + $setId + '</set-ids>')
    [void]$sb.AppendLine('                <picture>' + (Esc $pic) + '</picture>')
    [void]$sb.AppendLine('                <description>' + (Esc $desc) + '</description>')
    # Обязательные param
    [void]$sb.AppendLine('                <param name="Рейтинг">' + $rating + '</param>')
    [void]$sb.AppendLine('                <param name="Число отзывов">' + $reviews + '</param>')
    [void]$sb.AppendLine('                <param name="Годы опыта">' + $exp + '</param>')
    [void]$sb.AppendLine('                <param name="Регион">' + $region + '</param>')
    [void]$sb.AppendLine('                <param name="Конверсия">' + $conv + '</param>')
    [void]$sb.AppendLine('                <param name="Ссылка на телефон">tel:+79654745262</param>')
    # Сохранённые собственные param исходного фида
    if ($o.param) {
        foreach ($pr in @($o.param)) {
            [void]$sb.AppendLine('                <param name="' + (Esc $pr.name) + '">' + (Esc (Clean $pr.'#text')) + '</param>')
        }
    }
    [void]$sb.AppendLine('            </offer>')
}

[void]$sb.AppendLine('        </offers>')
[void]$sb.AppendLine('    </shop>')
[void]$sb.AppendLine('</yml_catalog>')

$content = $sb.ToString()
$utf8Bom = New-Object System.Text.UTF8Encoding $true
[System.IO.File]::WriteAllText($src, $content, $utf8Bom)
Copy-Item $src (Join-Path $PSScriptRoot 'yandex_market.yml') -Force

# Контроль: валидный XML и соблюдение требований
$chk = [xml](Get-Content $src -Raw -Encoding UTF8)
$coffers = @($chk.yml_catalog.shop.offers.offer)
$csets = @($chk.yml_catalog.shop.sets.set)
"Offers: $($coffers.Count), Sets: $($csets.Count)"
$urls = $coffers | ForEach-Object { $_.url } | Group-Object | Where-Object Count -gt 1
$pics = $coffers | ForEach-Object { $_.picture } | Group-Object | Where-Object Count -gt 1
if ($urls) { throw 'Найдены дубли URL: ' + ($urls.Name -join ', ') }
if ($pics) { throw 'Найдены дубли picture: ' + ($pics.Name -join ', ') }
$bad = $coffers | Where-Object { -not $_.name -or -not $_.'set-ids' -or -not (@($_.param) | Where-Object { $_.name -eq 'Рейтинг' }) }
if ($bad) { throw 'Не все offers содержат обязательные элементы: ' + (($bad | ForEach-Object { $_.id }) -join ', ') }
'OK: XML валиден, уникальность URL/picture соблюдена, обязательные элементы на месте'

