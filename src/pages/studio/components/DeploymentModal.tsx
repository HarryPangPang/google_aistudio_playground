import React from 'react';
import './css/DeploymentModal.scss';

interface DeploymentModalProps {
    deployUrl: string;
    onClose: () => void;
}

export const DeploymentModal: React.FC<DeploymentModalProps> = ({ deployUrl, onClose }) => {
    if (!deployUrl) return null;

    return (
        <div className="deployment-modal-overlay">
            <div className="deployment-modal">
                <h3>Deployment Ready</h3>
                <p>Your project is live! Share this URL with others.</p>

                <div className="url-box">
                    <span>{deployUrl}</span>
                </div>

                <div className="modal-actions">
                    <button
                        onClick={onClose}
                        className="close-btn"
                    >
                        Close
                    </button>
                    <button
                        onClick={() => {
                            window.open(deployUrl, '_blank');
                        }}
                        className="open-btn"
                    >
                        Open Site
                    </button>
                </div>
            </div>
        </div>
    );
};
