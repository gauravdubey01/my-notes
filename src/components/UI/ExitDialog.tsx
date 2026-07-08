import { openUrl } from "@tauri-apps/plugin-opener";
import { FiX, FiExternalLink, FiLogOut } from "react-icons/fi";

interface ExitDialogProps {
  onClose: () => void;
  onExit: () => void;
}

export default function ExitDialog({ onClose, onExit }: ExitDialogProps) {
  const handleExit = () => {
    onExit();
  };

  const handleSupport = () => {
    openUrl("https://ko-fi.com/gauravdubeypro");
  };

  return (
    <div className="exit-overlay" onClick={onClose}>
      <div className="exit-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="exit-header">
          <h2>Exit My Notes?</h2>
          <button className="icon-btn" onClick={onClose}>
            <FiX size={18} />
          </button>
        </div>
        <div className="exit-body">
          <p>Are you sure you want to exit?</p>
          <p className="exit-support-msg">
            If you enjoy using <strong>My Notes</strong>, please consider supporting the creator! ❤️
          </p>
        </div>
        <div className="exit-actions">
          <button className="btn btn-primary" onClick={handleExit}>
            <FiLogOut size={16} /> Exit
          </button>
          <button className="btn btn-secondary" onClick={handleSupport}>
            <FiExternalLink size={16} /> Support on Ko-fi
          </button>
          <button className="btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
