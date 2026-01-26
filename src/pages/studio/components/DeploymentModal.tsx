import React from 'react';

interface DeploymentModalProps {
    deployUrl: string;
    onClose: () => void;
}

export const DeploymentModal: React.FC<DeploymentModalProps> = ({ deployUrl, onClose }) => {
    if (!deployUrl) return null;

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
                padding: '32px',
                borderRadius: '16px',
                width: '440px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                fontFamily: "'Inter', sans-serif"
            }}>
                <h3 style={{ marginTop: 0, marginBottom: '8px', fontSize: '20px', color: '#111', fontWeight: 600 }}>Deployment Ready</h3>
                <p style={{ marginTop: 0, marginBottom: '20px', color: '#666', fontSize: '14px', lineHeight: 1.5 }}>Your project is live! Share this URL with others.</p>

                <div style={{
                    backgroundColor: '#f5f5f5',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    marginBottom: '24px',
                    wordBreak: 'break-all',
                    fontFamily: 'monospace',
                    fontSize: '13px',
                    border: '1px solid #eaeaea',
                    color: '#333',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <span>{deployUrl}</span>
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '10px 20px',
                            cursor: 'pointer',
                            backgroundColor: 'white',
                            color: '#666',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: 500
                        }}
                    >
                        Close
                    </button>
                    <button
                        onClick={() => {
                            window.open(deployUrl, '_blank');
                        }}
                        style={{
                            padding: '10px 20px',
                            cursor: 'pointer',
                            backgroundColor: '#000',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: 500
                        }}
                    >
                        Open Site
                    </button>
                </div>
            </div>
        </div>
    );
};
