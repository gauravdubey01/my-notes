import { useState } from "react";
import { useUIStore } from "../../store/uiStore";
import { exportBackup, importBackup, saveBackupToDisk, loadBackupFromDisk } from "../../utils/backup";
import { FiX, FiDownload, FiUpload, FiFolder } from "react-icons/fi";

export default function SettingsPanel() {
  const { setShowSettings } = useUIStore();
  const [backupStatus, setBackupStatus] = useState<string>("");

  const handleExport = async () => {
    try {
      setBackupStatus("Exporting...");
      const data = await exportBackup();
      saveBackupToDisk(data);
      setBackupStatus("Backup saved to disk!");
    } catch (e) {
      setBackupStatus(`Export failed: ${e}`);
    }
  };

  const handleImport = async () => {
    try {
      setBackupStatus("Select a backup file...");
      const text = await loadBackupFromDisk();
      setBackupStatus("Importing...");
      await importBackup(text);
      setBackupStatus("Import successful! Reload to see changes.");
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
            Export all your books, chapters, and notes as a JSON file on your computer.
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
            Your notes are stored locally in an SQLite database.
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
