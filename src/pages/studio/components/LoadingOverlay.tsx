import React from 'react';
import './css/LoadingOverlay.scss';

interface LoadingOverlayProps {
    status: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ status }) => {
    if (status !== 'creating' && status !== 'deploying') return null;

    return (
        <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <div className="loading-title">
                {status === 'creating' ? 'Creating your application...' : 'Deploying your application...'}
            </div>
            <div className="loading-desc">
                {status === 'creating' ? 'Writing code and assets' : 'Building and launching'}
            </div>
        </div>
    );
};
