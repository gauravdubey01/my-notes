import { exportBackup as bridgeExport, importBackup as bridgeImport } from "./bridge";

export async function exportBackup(): Promise<string> {
  return bridgeExport();
}

export async function importBackup(data: string): Promise<void> {
  return bridgeImport(data);
}

export function saveBackupToDisk(data: string): void {
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `my-notes-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function loadBackupFromDisk(): Promise<string> {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        reject(new Error("No file selected"));
        return;
      }
      try {
        const text = await file.text();
        resolve(text);
      } catch (err) {
        reject(err);
      }
    };
    input.onerror = () => reject(new Error("File selection failed"));
    input.click();
  });
}
