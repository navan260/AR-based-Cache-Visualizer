interface ViewToggleProps {
    is3D: boolean;
    onToggle: (is3D: boolean) => void;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ is3D, onToggle }) => {
    return (
        <div className="view-toggle-container">
            <label className="toggle-label">
                <span className="text-sm text-slate-300">View Mode:</span>
                <div className="toggle-buttons">
                    <button
                        className={`toggle-btn ${!is3D ? 'active' : ''}`}
                        onClick={() => onToggle(false)}
                    >
                        <span className="btn-icon">📊</span>
                        <span className="btn-text">2D</span>
                    </button>
                    <button
                        className={`toggle-btn ${is3D ? 'active' : ''}`}
                        onClick={() => onToggle(true)}
                    >
                        <span className="btn-icon">🎲</span>
                        <span className="btn-text">3D</span>
                    </button>
                </div>
            </label>
        </div>
    );
};
