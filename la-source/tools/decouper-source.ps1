# decouper-source.ps1 - decoupe index.html (monolithe) en sections sous src/.
#
# AUTO-DECOUVERTE : les frontieres sont les MARQUEURS deja presents dans le code
#   JS  (colonne 0) :  /* ---------- nom ---------- */   ou   /* ========== nom
#   CSS (indente 2) :    /* ---------- nom ---------- */
# Ajouter un marqueur = creer une section au prochain decoupage. Aucune table a
# maintenir : le fichier vivant reste la verite, l'outil s'y adapte.
#
# GARANTIE : la concatenation des sections (dans l'ordre du manifest) reproduit
# index.html OCTET POUR OCTET - verifie avant d'ecrire quoi que ce soit dans src/
# (construction en dossier temporaire, bascule seulement si la preuve passe).
#
# Tout le tranchage se fait en Latin-1 (1 octet = 1 caractere) : aucune
# interpretation d'encodage, aucun risque UTF-8/BOM/CRLF.
#
# Usage :  powershell -File tools\decouper-source.ps1        (depuis la-source\)
$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
$index = Join-Path $root "index.html"
$src = Join-Path $root "src"
$enc = [System.Text.Encoding]::GetEncoding(28591)   # Latin-1 : octets purs

if (-not (Test-Path $index)) { throw "index.html introuvable : $index" }
$doc = [System.IO.File]::ReadAllText($index, $enc)
$lines = $doc.Split([char]10)
$n = $lines.Count

# offsets (en octets) du debut de chaque ligne + sentinelle de fin
$off = New-Object int[] ($n + 1)
for ($i = 0; $i -lt $n; $i++) { $off[$i + 1] = $off[$i] + $lines[$i].Length + 1 }
$off[$n] = $doc.Length

function Find-One([string]$exact) {
  $hits = @()
  for ($i = 0; $i -lt $script:n; $i++) { if ($script:lines[$i] -ceq $exact) { $hits += $i } }
  if ($hits.Count -ne 1) { throw ("charniere '" + $exact + "' : " + $hits.Count + " occurrence(s), 1 attendue") }
  $hits[0]
}
$sty = Find-One "<style>"
$esty = Find-One "</style>"
$scr = Find-One "<script>"
$escr = Find-One "</script>"

# nom de fichier depuis le texte d'un marqueur (les octets sont de l'UTF-8 lu en
# Latin-1 : on les re-decode en UTF-8 pour translitterer les accents)
function Nom([string]$ligne) {
  $t = [System.Text.Encoding]::UTF8.GetString($enc.GetBytes($ligne))
  $t = $t -replace '/\*', '' -replace '\*/', '' -replace '[-=]{4,}', ''
  $t = $t.ToLowerInvariant()
  # translitteration des accents (codes Latin-1, source ASCII pure)
  $paires = @(@(0xE9,"e"),@(0xE8,"e"),@(0xEA,"e"),@(0xEB,"e"),@(0xE0,"a"),@(0xE2,"a"),@(0xE4,"a"),
              @(0xF9,"u"),@(0xFB,"u"),@(0xFC,"u"),@(0xEE,"i"),@(0xEF,"i"),@(0xF4,"o"),@(0xF6,"o"),@(0xE7,"c"))
  foreach ($p in $paires) { $t = $t.Replace([string][char][int]$p[0], [string]$p[1]) }
  $t = $t.Replace([string][char]0x153, "oe").Replace([string][char]0x2019, "-")
  $t = $t -replace "[^a-z0-9]+", "-"
  $t = $t.Trim("-")
  if ($t.Length -gt 34) { $t = $t.Substring(0, 34).TrimEnd("-") }
  if (-not $t) { $t = "section" }
  $t
}

# frontieres d'une plage : sections aux marqueurs ; le contenu avant le premier
# marqueur rejoint la premiere section s'il est blanc, sinon devient une section
# de tete de plage
function Bornes([int]$debut, [int]$fin, [string]$regex, [string]$nomTete) {
  $marks = @()
  for ($i = $debut; $i -lt $fin; $i++) { if ($script:lines[$i] -match $regex) { $marks += $i } }
  $res = @()
  if ($marks.Count -eq 0) { $res += , @($debut, $nomTete); return , $res }
  if ($marks[0] -gt $debut) {
    $blanc = $true
    for ($i = $debut; $i -lt $marks[0]; $i++) { if ($script:lines[$i].Trim()) { $blanc = $false; break } }
    if ($blanc) { $marks[0] = $debut } else { $res += , @($debut, $nomTete) }
  }
  foreach ($m in $marks) { $res += , @($m, (Nom $script:lines[$m])) }
  , $res
}

# table des sections : (ligne 0-based, repertoire, nom)
$secs = @()
$secs += , @(0, "html", "tete")
foreach ($b in (Bornes ($sty + 1) $esty '^  /\* (-{4,}|={4,})' "base")) { $secs += , @($b[0], "css", $b[1]) }
$secs += , @($esty, "html", "corps")
foreach ($b in (Bornes ($scr + 1) $escr '^/\* (-{4,}|={4,})' "entete")) { $secs += , @($b[0], "js", $b[1]) }
$secs += , @($escr, "html", "fin")

# numerotation par repertoire + dedoublonnage des noms
$cnt = @{}; $vus = @{}
$manifest = @()
$pieces = @()
for ($i = 0; $i -lt $secs.Count; $i++) {
  $ligne = $secs[$i][0]; $dir = $secs[$i][1]; $nom = $secs[$i][2]
  $cle = $dir + "/" + $nom
  if ($vus.ContainsKey($cle)) { $vus[$cle]++; $nom = $nom + "-" + $vus[$cle] } else { $vus[$cle] = 1 }
  if (-not $cnt.ContainsKey($dir)) { $cnt[$dir] = 0 }
  $cnt[$dir] += 10
  $fn = "src/{0}/{1:d3}-{2}.{0}" -f $dir, $cnt[$dir], $nom
  $finL = if ($i -lt $secs.Count - 1) { $secs[$i + 1][0] } else { $n }
  $pieces += , @($fn, $doc.Substring($off[$ligne], $off[$finL] - $off[$ligne]))
  $manifest += $fn
}

# PREUVE avant ecriture : la concatenation reproduit le document, octet pour octet
$sb = New-Object System.Text.StringBuilder
foreach ($p in $pieces) { [void]$sb.Append($p[1]) }
if (-not [string]::Equals($sb.ToString(), $doc, [System.StringComparison]::Ordinal)) {
  throw "PREUVE ECHOUEE : la concatenation ne reproduit pas index.html - rien n'a ete ecrit"
}

# bascule : temporaire puis remplacement
$tmp = Join-Path $root ("src._nouveau_" + [Guid]::NewGuid().ToString("N").Substring(0, 6))
foreach ($d in "html", "css", "js") { New-Item -ItemType Directory -Force (Join-Path $tmp $d) | Out-Null }
foreach ($p in $pieces) {
  $dest = Join-Path $tmp ($p[0] -replace '^src/', '')
  [System.IO.File]::WriteAllText($dest, $p[1], $enc)
}
[System.IO.File]::WriteAllText((Join-Path $tmp "manifest.txt"), (($manifest -join "`n") + "`n"), $enc)
$sha = (Get-FileHash $index -Algorithm SHA1).Hash.ToLower()
[System.IO.File]::WriteAllText((Join-Path $tmp ".source-sha1"), ($sha + "`n"), $enc)
if (Test-Path $src) { Remove-Item -Recurse -Force $src }
Move-Item $tmp $src

Write-Output ("Decoupage OK -> src/  (" + $pieces.Count + " sections)")
Write-Output ("sha1 index.html : " + $sha)
Write-Output "Preuve : concatenation == index.html, octet pour octet."
