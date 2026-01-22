import React from 'react';

interface HeaderProps {
    isSaving: boolean;
    isDeploying: boolean;
    onSave: () => void;
    onDownload: () => void;
    onDeploy: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isSaving, isDeploying, onSave, onDownload, onDeploy }) => {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            padding: '16px 24px',
            gap: '12px',
            borderBottom: '1px solid #f0f0f0',
            backgroundColor: '#fff',
            position: 'sticky',
            top: 0,
            zIndex: 100
        }}>
            {/* 保留按钮，方便后续使用 */}
            {/* <button
                onClick={onSave}
                disabled={isSaving}
                style={{
                    padding: '8px 16px',
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    backgroundColor: 'white',
                    color: '#333',
                    border: '1px solid #e0e0e0',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: 500,
                    transition: 'all 0.2s'
                }}
            >
                {isSaving ? 'Saving...' : 'Save'}
            </button>
            <button
                onClick={onDownload}
                style={{
                    padding: '8px 16px',
                    cursor: 'pointer',
                    backgroundColor: 'white',
                    color: '#333',
                    border: '1px solid #e0e0e0',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: 500,
                    transition: 'all 0.2s'
                }}
            >
                Download
            </button> */}
            <button
                onClick={onDeploy}
                disabled={isDeploying}
                style={{
                    padding: '8px 16px',
                    cursor: isDeploying ? 'not-allowed' : 'pointer',
                    backgroundColor: '#000',
                    color: 'white',
                    border: 'none',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: 500,
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                    transition: 'all 0.2s'
                }}
            >
                {isDeploying ? 'Deploying...' : 'Deploy'}
            </button>
        </div>
    );
};
