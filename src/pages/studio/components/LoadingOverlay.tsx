import React from 'react';
import { useI18n } from '../../../context/I18nContext';
import './css/LoadingOverlay.scss';

interface LoadingOverlayProps {
    status: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ status }) => {
    const { $l } = useI18n();

    if (status !== 'creating' && status !== 'deploying') return null;

    return (
        <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <div className="loading-title">
                {status === 'creating' ? $l('studio.loading.creatingTitle') : $l('studio.loading.deployingTitle')}
            </div>
            <div className="loading-desc">
                {status === 'creating' ? $l('studio.loading.creatingDesc') : $l('studio.loading.deployingDesc')}
            </div>
        </div>
    );
};
