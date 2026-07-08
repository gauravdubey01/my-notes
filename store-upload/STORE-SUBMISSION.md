# Microsoft Store Submission - My Neatbook

## Files Included

| File | Path | Purpose |
|------|------|---------|
| MSIX Package | `MyNeatbook_2.0.0_x64.msix` | **Store package** upload to Partner Center (3.4 MB) |
| MSI Installer | `msi/My Neatbook_2.0.0_x64_en-US.msi` | Classic installer (3.5 MB) |
| NSIS Installer | `nsis/My Neatbook_2.0.0_x64-setup.exe` | Lightweight installer (2.3 MB) |
| Standalone EXE | `exe/My Neatbook.exe` | Direct-run binary (11 MB) |
| MSIX Source Files | `msix/` | Files used to build the MSIX package |
| Icons | `icons/` | App icons for listing |
| Config | `tauri.conf.json` | App configuration reference |

## Partner Center Steps

1. **Create a new app** in Partner Center with name "My Neatbook"
2. **Reserve the name** — Partner Center will assign a new identity; update `AppxManifest.xml` if needed
3. **Upload the MSIX** (`MyNeatbook_2.0.0_x64.msix`) as the package
4. **Submit for certification**

## Requirements

- **Windows 10+** (x64, version 1809+)
- **WebView2 Runtime** (included with Windows 11, auto-installs on Windows 10)
- Capability: `runFullTrust` (Desktop Bridge app)
