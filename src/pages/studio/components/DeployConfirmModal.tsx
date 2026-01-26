import React from 'react';

interface DeployConfirmModalProps {
    visible: boolean;
    appId: string;
    onConfirm: (confirmed: boolean) => void;
}

export const DeployConfirmModal: React.FC<DeployConfirmModalProps> = ({ visible, appId, onConfirm }) => {
    if (!visible) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '28px',
                borderRadius: '14px',
                width: '440px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                fontFamily: "'Inter', sans-serif"
            }}>
                <h3 style={{ marginTop: 0, marginBottom: '8px', fontSize: '18px', color: '#111', fontWeight: 600 }}>
                    Deploy this app now?
                </h3>
                <p style={{ marginTop: 0, marginBottom: '16px', color: '#666', fontSize: '14px', lineHeight: 1.5 }}>
                    App ID: <span style={{ fontFamily: 'monospace' }}>{appId || '-'}</span>
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button
                        onClick={() => onConfirm(false)}
                        style={{
                            padding: '8px 16px',
                            cursor: 'pointer',
                            backgroundColor: 'white',
                            color: '#666',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: 500
                        }}
                    >
                        Not now
                    </button>
                    <button
                        onClick={() => onConfirm(true)}
                        style={{
                            padding: '8px 16px',
                            cursor: 'pointer',
                            backgroundColor: '#000',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: 500
                        }}
                    >
                        Deploy
                    </button>
                </div>
            </div>
        </div>
    );
};
