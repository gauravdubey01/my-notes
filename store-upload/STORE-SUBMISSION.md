# Microsoft Store Submission - My Neatbook

## Files Included

| File | Path | Purpose |
|------|------|---------|
| MSI Installer | `msi/My Neatbook_2.0.0_x64_en-US.msi` | Primary Store package (3.5 MB) |
| NSIS Installer | `nsis/My Neatbook_2.0.0_x64-setup.exe` | Alternative installer (2.3 MB) |
| Standalone EXE | `exe/My Neatbook.exe` | Direct-run binary (15 MB) |
| Icons | `icons/` | App icons for listing |
| Config | `tauri.conf.json` | App configuration reference |

## Partner Center Steps

1. **Create a new app** in Partner Center with name "My Neatbook"
2. **Reserve the name** and note the App Identity
3. **Upload the MSI** (`msi/My Neatbook_2.0.0_x64_en-US.msi`) as the package
4. **Submit for certification**

## Requirements

- **Windows 10+** (x64)
- **WebView2 Runtime** (included with Windows 11, auto-installs on Windows 10)
- No special capabilities required
