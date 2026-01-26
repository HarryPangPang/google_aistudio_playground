import React from 'react';
import './css/DeployConfirmModal.scss';

interface DeployConfirmModalProps {
    visible: boolean;
    appId: string;
    onConfirm: (confirmed: boolean) => void;
}

export const DeployConfirmModal: React.FC<DeployConfirmModalProps> = ({ visible, appId, onConfirm }) => {
    if (!visible) return null;

    return (
        <div className="deploy-confirm-overlay">
            <div className="deploy-confirm-modal">
                <h3>
                    Deploy this app now?
                </h3>
                <p>
                    App ID: <span className="app-id">{appId || '-'}</span>
                </p>
                <div className="modal-actions">
                    <button
                        onClick={() => onConfirm(false)}
                        className="cancel-btn"
                    >
                        Not now
                    </button>
                    <button
                        onClick={() => onConfirm(true)}
                        className="confirm-btn"
                    >
                        Deploy
                    </button>
                </div>
            </div>
        </div>
    );
};
