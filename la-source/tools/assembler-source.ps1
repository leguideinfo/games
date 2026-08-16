# assembler-source.ps1 - reconstruit index.html depuis les sections de src/
# (concatenation dans l'ordre de src/manifest.txt, en octets purs).
#
# GARDE ANTI-ECRASEMENT : si index.html a change depuis le dernier decoupage
# (edition mobile, autre poste), l'outil REFUSE d'ecraser - relancer d'abord
# tools\decouper-source.ps1 pour resynchroniser src/, ou passer -Force en
# pleine connaissance de cause.
#
# Usage :  powershell -File tools\assembler-source.ps1            -> index.html
#          powershell -File tools\assembler-source.ps1 -Out x.html (test, sans garde)
param(
  [string]$Out,
  [switch]$Force
)
$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
$src = Join-Path $root "src"
$index = Join-Path $root "index.html"
$manifest = Join-Path $src "manifest.txt"
$shaFile = Join-Path $src ".source-sha1"
$enc = [System.Text.Encoding]::GetEncoding(28591)   # Latin-1 : octets purs

if (-not (Test-Path $manifest)) { throw "src/manifest.txt introuvable - lancer d'abord tools\decouper-source.ps1" }
$files = @([System.IO.File]::ReadAllText($manifest, $enc) -split "`n" | Where-Object { $_ -and -not $_.StartsWith("#") })

if (-not $Out -and (Test-Path $index) -and (Test-Path $shaFile) -and -not $Force) {
  $cur = (Get-FileHash $index -Algorithm SHA1).Hash.ToLower()
  $rec = ([System.IO.File]::ReadAllText($shaFile, $enc)).Trim().ToLower()
  if ($cur -ne $rec) {
    throw "index.html a change depuis le dernier decoupage (edition mobile ?). Lancer tools\decouper-source.ps1 pour resynchroniser src/, ou -Force pour ecraser."
  }
}

$sb = New-Object System.Text.StringBuilder
foreach ($rel in $files) {
  $p = Join-Path $root $rel
  if (-not (Test-Path $p)) { throw ("section manquante : " + $rel) }
  [void]$sb.Append([System.IO.File]::ReadAllText($p, $enc))
}
$cible = if ($Out) { $Out } else { $index }
[System.IO.File]::WriteAllText($cible, $sb.ToString(), $enc)
$sha = (Get-FileHash $cible -Algorithm SHA1).Hash.ToLower()
if (-not $Out) { [System.IO.File]::WriteAllText($shaFile, ($sha + "`n"), $enc) }

Write-Output ("Assemblage OK -> " + $cible + "  (" + $files.Count + " sections)")
Write-Output ("sha1 : " + $sha)
