# assembler-source.ps1 - reconstruit index.html depuis les sections de src/
# (concatenation dans l'ordre de src/manifest.txt, en octets purs).
#
# GARDES :
#  - anti-ecrasement : si index.html a change depuis le dernier decoupage
#    (edition mobile, autre poste), REFUS - relancer tools\decouper-source.ps1
#    d'abord, ou -Force en pleine connaissance de cause. L'absence de
#    src/.source-sha1 est un REFUS aussi (fail-closed : etat inverifiable).
#  - anti-orphelins : tout fichier present sous src/{html,css,js} mais absent
#    du manifest est un REFUS (il serait silencieusement exclu de l'assemblage
#    puis detruit au prochain decoupage). Nouvelle section = nouveau MARQUEUR
#    dans une section existante, jamais un fichier cree a la main.
#  - lecture en OCTETS PURS (jamais ReadAllText : il avale les BOM et re-decode
#    en douce - corruption verifiee en test adversarial du 16/08).
#
# Usage :  powershell -ExecutionPolicy Bypass -File tools\assembler-source.ps1
#          powershell -ExecutionPolicy Bypass -File tools\assembler-source.ps1 -Out x.html
#          (-Out = temoin de test ; il ne met pas a jour l'etat de synchro,
#           et viser index.html via -Out repasse par la garde normale)
param(
  [string]$Out,
  [switch]$Force
)
$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
$src = Join-Path $root "src"
$index = Join-Path $root "index.html"
$manifeste = Join-Path $src "manifest.txt"
$shaFichier = Join-Path $src ".source-sha1"
$enc = [System.Text.Encoding]::GetEncoding(28591)   # Latin-1 : 1 octet = 1 caractere

function Lire([string]$chemin) { $enc.GetString([System.IO.File]::ReadAllBytes($chemin)) }
function Sha([string]$texte) {
  $h = [System.Security.Cryptography.SHA1]::Create().ComputeHash($enc.GetBytes($texte))
  ([System.BitConverter]::ToString($h)).Replace("-", "").ToLower()
}

if (-not (Test-Path $manifeste)) { throw "src/manifest.txt introuvable - lancer d'abord tools\decouper-source.ps1" }
$files = @((Lire $manifeste).Split([char]10) | Where-Object { $_ -and -not $_.StartsWith("#") })

# -Out relatif : ancre sur le repertoire courant de l'appelant (pas celui du process)
if ($Out -and -not [System.IO.Path]::IsPathRooted($Out)) {
  $Out = Join-Path (Get-Location).ProviderPath $Out
}
# viser index.html via -Out = mode normal (garde active, etat de synchro mis a jour)
$modeNormal = $true
if ($Out) {
  $cibleAbs = [System.IO.Path]::GetFullPath($Out)
  $indexAbs = [System.IO.Path]::GetFullPath($index)
  if (-not [string]::Equals($cibleAbs, $indexAbs, [System.StringComparison]::OrdinalIgnoreCase)) { $modeNormal = $false }
}

# GARDE anti-orphelins : aucun fichier hors manifest sous src/{html,css,js}
$connus = @{}
foreach ($rel in $files) { $connus[($rel -replace '/', '\')] = 1 }
$orphelins = @()
foreach ($d in "html", "css", "js") {
  $dossier = Join-Path $src $d
  if (-not (Test-Path $dossier)) { continue }
  foreach ($fs in (Get-ChildItem $dossier -File)) {
    $rel = "src\" + $d + "\" + $fs.Name
    if (-not $connus.ContainsKey($rel)) { $orphelins += $rel }
  }
}
if ($orphelins.Count -gt 0) {
  throw ("fichier(s) hors manifest sous src/ : " + ($orphelins -join ", ") + " - un tel fichier serait exclu de l'assemblage puis detruit au prochain decoupage. Nouvelle section = nouveau MARQUEUR /* ---------- nom ---------- */ dans une section existante (jamais un fichier cree a la main) ; sinon, supprimer ou integrer ce fichier.")
}

# GARDE anti-ecrasement (fail-closed)
if ($modeNormal -and (Test-Path $index) -and -not $Force) {
  if (-not (Test-Path $shaFichier)) {
    throw "src/.source-sha1 absent : impossible de verifier que index.html n'a pas change depuis le decoupage. Relancer tools\decouper-source.ps1, ou -Force en pleine connaissance de cause."
  }
  $cur = Sha (Lire $index)
  $rec = (Lire $shaFichier).Trim().ToLower()
  if ($cur -ne $rec) {
    throw "index.html a change depuis le dernier decoupage (edition mobile ?). SAUVEGARDER le travail de src/ (commit git), relancer tools\decouper-source.ps1 pour resynchroniser, ou -Force pour ecraser."
  }
}

$sb = New-Object System.Text.StringBuilder
foreach ($rel in $files) {
  $p = Join-Path $root $rel
  if (-not (Test-Path $p)) { throw ("section manquante : " + $rel) }
  [void]$sb.Append((Lire $p))
}
$texte = $sb.ToString()
$sha = Sha $texte   # hash des octets reellement ecrits (pas de relecture disque)
$cible = if ($Out) { $Out } else { $index }
[System.IO.File]::WriteAllBytes($cible, $enc.GetBytes($texte))
if ($modeNormal) { [System.IO.File]::WriteAllBytes($shaFichier, $enc.GetBytes($sha + "`n")) }

Write-Output ("Assemblage OK -> " + $cible + "  (" + $files.Count + " sections)")
Write-Output ("sha1 : " + $sha)
