import React from 'react';

interface LoadingOverlayProps {
    status: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ status }) => {
    if (status !== 'creating' && status !== 'deploying') return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255,255,255,0.8)',
            backdropFilter: 'blur(2px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200
        }}>
            <div style={{
                width: '60px',
                height: '60px',
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #000',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginBottom: '24px'
            }}></div>
            <div style={{
                fontSize: '18px',
                fontWeight: 600,
                color: '#333'
            }}>
                {status === 'creating' ? 'Creating your application...' : 'Deploying your application...'}
            </div>
            <div style={{
                fontSize: '14px',
                color: '#666',
                marginTop: '8px'
            }}>
                {status === 'creating' ? 'Writing code and assets' : 'Building and launching'}
            </div>
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};
