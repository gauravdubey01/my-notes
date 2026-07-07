import { useState } from "react";
import { useUIStore } from "../../store/uiStore";
import { exportWithDialog, importWithDialog } from "../../utils/bridge";
import { FiX, FiDownload, FiUpload, FiFolder } from "react-icons/fi";

export default function SettingsPanel() {
  const { setShowSettings } = useUIStore();
  const [backupStatus, setBackupStatus] = useState<string>("");

  const handleExport = async () => {
    try {
      setBackupStatus("Select location...");
      const result = await exportWithDialog();
      if (result === "ok") {
        setBackupStatus("Backup saved successfully!");
      } else {
        setBackupStatus("Export cancelled.");
      }
    } catch (e) {
      setBackupStatus(`Export failed: ${e}`);
    }
  };

  const handleImport = async () => {
    try {
      setBackupStatus("Select a backup file...");
      const result = await importWithDialog();
      if (result === "ok") {
        setBackupStatus("Import successful! Reload to see changes.");
      } else {
        setBackupStatus("Import cancelled.");
      }
    } catch (e) {
      setBackupStatus(`Import failed: ${e}`);
    }
  };

  return (
    <div className="settings-overlay" onClick={() => setShowSettings(false)}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>Settings</h2>
          <button
            className="icon-btn"
            onClick={() => setShowSettings(false)}
          >
            <FiX size={18} />
          </button>
        </div>

        <div className="settings-section">
          <h3>Backup & Restore</h3>
          <p className="settings-desc">
            Export all your journals, chapters, and entries as a JSON file on your computer.
            Import a previous backup to restore your data.
          </p>
          <div className="settings-buttons">
            <button className="btn btn-secondary" onClick={handleExport}>
              <FiDownload size={16} /> Export to Local Drive
            </button>
            <button className="btn btn-secondary" onClick={handleImport}>
              <FiUpload size={16} /> Import from Local Drive
            </button>
          </div>
        </div>

        <div className="settings-section">
          <h3>Data Location</h3>
          <p className="settings-desc">
            <FiFolder size={14} style={{ marginRight: 6 }} />
            Your notes are stored locally in a JSON file.
            Use the backup feature above to save a portable copy.
          </p>
        </div>

        <div className="settings-section">
          <h3>About</h3>
          <p className="settings-desc">
            My Notes v1.0.0
            <br />
            A precious journal — your personal notes app.
          </p>
        </div>

        {backupStatus && (
          <div className="settings-status">{backupStatus}</div>
        )}
      </div>
    </div>
  );
}
