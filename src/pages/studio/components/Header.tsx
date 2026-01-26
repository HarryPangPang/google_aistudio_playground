import React from 'react';
import './css/Header.scss';

interface HeaderProps {
    isSaving: boolean;
    isDeploying: boolean;
    onSave: () => void;
    onDownload: () => void;
    onDeploy: () => void;
    onHistoryClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isSaving, isDeploying, onSave, onDownload, onDeploy, onHistoryClick }) => {
    return (
        <div className="studio-header">
            <button
                onClick={onHistoryClick}
                className="history-toggle-btn"
                title="History"
            >
                ☰
            </button>

            <div className="header-actions">
                <button
                    onClick={onDeploy}
                    disabled={isDeploying}
                    className="action-btn primary"
                >
                    {isDeploying ? 'Deploying...' : 'Deploy'}
                </button>
            </div>
        </div>
    );
};
