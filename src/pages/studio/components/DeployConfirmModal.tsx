import React from 'react';
import { useI18n } from '../../../context/I18nContext';
import './css/DeployConfirmModal.scss';

interface DeployConfirmModalProps {
    visible: boolean;
    appId: string;
    onConfirm: (confirmed: boolean) => void;
}

export const DeployConfirmModal: React.FC<DeployConfirmModalProps> = ({ visible, appId, onConfirm }) => {
    const { $l } = useI18n();

    if (!visible) return null;

    return (
        <div className="deploy-confirm-overlay">
            <div className="deploy-confirm-modal">
                <h3>
                    {$l('studio.deployConfirm.title')}
                </h3>
                <p>
                    {$l('studio.deployConfirm.appId')}: <span className="app-id">{appId || '-'}</span>
                </p>
                <div className="modal-actions">
                    <button
                        onClick={() => onConfirm(false)}
                        className="cancel-btn"
                    >
                        {$l('common.notNow')}
                    </button>
                    <button
                        onClick={() => onConfirm(true)}
                        className="confirm-btn"
                    >
                        {$l('common.deploy')}
                    </button>
                </div>
            </div>
        </div>
    );
};
