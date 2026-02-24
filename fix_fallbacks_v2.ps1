$baseDir = "c:\GitHub\leelaclue.github.io"

function Fix-File($path, $replacement) {
    if (Test-Path $path) {
        $content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
        $pattern = '<a href="privacy_web.html" data-i18n="webPrivacyTitle">Website Privacy</a>'
        if ($content.Contains($pattern)) {
            $newContent = $content.Replace($pattern, '<a href="privacy_web.html" data-i18n="webPrivacyTitle">' + $replacement + '</a>')
            [System.IO.File]::WriteAllText($path, $newContent, [System.Text.Encoding]::UTF8)
        }
    }
}

# German
$filesDe = Get-ChildItem -Path (Join-Path $baseDir "de") -Filter *.html
foreach ($file in $filesDe) {
    if ($file.Name -eq "privacy_web.html") { continue }
    Fix-File $file.FullName "Website-Datenschutz"
}

# Russian
# We use decimal char codes for Russian characters to avoid script encoding issues
$ruText = [char]0x041a + [char]0x043e + [char]0x043d + [char]0x0444 + [char]0x0438 + [char]0x0434 + [char]0x0435 + [char]0x043d + [char]0x0446 + [char]0x0438 + [char]0x0430 + [char]0x043b + [char]0x044c + [char]0x043d + [char]0x043e + [char]0x0441 + [char]0x0442 + [char]0x044c + " " + [char]0x0441 + [char]0x0430 + [char]0x0439 + [char]0x0442 + [char]0x0430
$filesRu = Get-ChildItem -Path (Join-Path $baseDir "ru") -Filter *.html
foreach ($file in $filesRu) {
    if ($file.Name -eq "privacy_web.html") { continue }
    Fix-File $file.FullName $ruText
}
