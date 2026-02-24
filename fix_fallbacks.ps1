$baseDir = "c:\GitHub\leelaclue.github.io"

# German
$filesDe = Get-ChildItem -Path (Join-Path $baseDir "de") -Filter *.html
foreach ($file in $filesDe) {
    if ($file.Name -eq "privacy_web.html") { continue }
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    $pattern = '<a href="privacy_web.html" data-i18n="webPrivacyTitle">Website Privacy</a>'
    $replacement = '<a href="privacy_web.html" data-i18n="webPrivacyTitle">Website-Datenschutz</a>'
    if ($content.Contains($pattern)) {
        $newContent = $content.Replace($pattern, $replacement)
        [System.IO.File]::WriteAllText($file.FullName, $newContent, [System.Text.Encoding]::UTF8)
    }
}

# Russian
$filesRu = Get-ChildItem -Path (Join-Path $baseDir "ru") -Filter *.html
foreach ($file in $filesRu) {
    if ($file.Name -eq "privacy_web.html") { continue }
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    $pattern = '<a href="privacy_web.html" data-i18n="webPrivacyTitle">Website Privacy</a>'
    $replacement = '<a href="privacy_web.html" data-i18n="webPrivacyTitle">Конфиденциальность сайта</a>'
    if ($content.Contains($pattern)) {
        $newContent = $content.Replace($pattern, $replacement)
        [System.IO.File]::WriteAllText($file.FullName, $newContent, [System.Text.Encoding]::UTF8)
    }
}
