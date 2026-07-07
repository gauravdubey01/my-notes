# Build MSIX package for Microsoft Store upload
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$AppName = "MyNotes"
$Version = "1.0.0.0"
$Csc = "C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\MSBuild\Current\Bin\Roslyn\csc.exe"

Write-Host "==> 1. Building React frontend..." -ForegroundColor Green
Push-Location $ScriptDir
npm run build
if (-not $?) { Write-Error "Frontend build failed."; exit 1 }
Pop-Location

Write-Host "==> 2. Compiling C# host..." -ForegroundColor Green
$refs = @(
    "/reference:System.Windows.Forms.dll",
    "/reference:System.Drawing.dll",
    "/reference:System.IO.Compression.dll",
    "/reference:System.IO.Compression.FileSystem.dll",
    "/reference:lib\Microsoft.Web.WebView2.Core.dll",
    "/reference:lib\Microsoft.Web.WebView2.WinForms.dll"
)
& $Csc /target:winexe /out:"$ScriptDir\$AppName.exe" $refs "$ScriptDir\MyNotes.cs" "$ScriptDir\NotesBridge.cs" 2>&1
if (-not $?) { Write-Error "C# compilation failed."; exit 1 }

Write-Host "==> 3. Building MSIX package..." -ForegroundColor Green
& $Csc /reference:"System.IO.Compression.dll" /reference:"System.IO.Compression.FileSystem.dll" /out:"$ScriptDir\BuildMsix.exe" "$ScriptDir\BuildMsix.cs" 2>&1
if (-not $?) { Write-Error "MSIX build tool compilation failed."; exit 1 }

& "$ScriptDir\BuildMsix.exe"
Remove-Item "$ScriptDir\BuildMsix.exe" -Force

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  READY FOR STORE UPLOAD" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
$uploadPath = "$ScriptDir\$AppName-$Version.msixupload"
Write-Host "  Upload file: $uploadPath" -ForegroundColor Cyan
Write-Host "  (or try the .msix directly if .msixupload fails)" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
Write-Host "  1. Go to https://partner.microsoft.com/dashboard" -ForegroundColor White
Write-Host "  2. Upload either: $AppName-$Version.msixupload (preferred) or .msix" -ForegroundColor White
Write-Host "  3. Submit for certification" -ForegroundColor White
