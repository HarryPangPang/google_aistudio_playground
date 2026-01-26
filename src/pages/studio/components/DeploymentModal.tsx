import React from 'react';
import { useI18n } from '../../../context/I18nContext';
import './css/DeploymentModal.scss';

interface DeploymentModalProps {
    deployUrl: string;
    onClose: () => void;
}

export const DeploymentModal: React.FC<DeploymentModalProps> = ({ deployUrl, onClose }) => {
    const { $l } = useI18n();

    if (!deployUrl) return null;

    return (
        <div className="deployment-modal-overlay">
            <div className="deployment-modal">
                <h3>{$l('studio.deploySuccess.title')}</h3>
                <p>{$l('studio.deploySuccess.desc')}</p>

                <div className="url-box">
                    <span>{deployUrl}</span>
                </div>

                <div className="modal-actions">
                    <button
                        onClick={onClose}
                        className="close-btn"
                    >
                        {$l('common.close')}
                    </button>
                    <button
                        onClick={() => {
                            window.open(deployUrl, '_blank');
                        }}
                        className="open-btn"
                    >
                        {$l('common.openSite')}
                    </button>
                </div>
            </div>
        </div>
    );
};
