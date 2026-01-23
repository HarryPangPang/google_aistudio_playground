import React from 'react';

interface SidebarProps {
    visible: boolean;
    history: any[];
    onSelect: (id: string) => void;
    onClose: () => void;
    onNewChat: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ visible, history, onSelect, onClose, onNewChat }) => {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: visible ? 0 : '-300px',
            width: '300px',
            height: '100%',
            backgroundColor: '#fff',
            boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
            zIndex: 1000,
            transition: 'left 0.3s ease',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <div style={{
                padding: '20px',
                borderBottom: '1px solid #f0f0f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>History</h2>
                <button 
                    onClick={onClose}
                    style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '20px',
                        cursor: 'pointer',
                        color: '#666'
                    }}
                >
                    ×
                </button>
            </div>

            <div style={{ padding: '16px' }}>
                 <button
                    onClick={() => {
                        onNewChat();
                        onClose();
                    }}
                    style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: '#000',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 500,
                        marginBottom: '10px'
                    }}
                >
                    + New Chat
                </button>
            </div>

            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '0 16px 16px'
            }}>
                {history.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#999', marginTop: '20px' }}>
                        No history yet
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {history.map((item, index) => (
                            <div
                                key={item.driveid || index}
                                onClick={() => {
                                    onSelect(item.driveid);
                                    onClose();
                                }}
                                style={{
                                    padding: '12px',
                                    borderRadius: '8px',
                                    backgroundColor: '#f9f9f9',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s',
                                    border: '1px solid #eee'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
                            >
                                <div style={{ 
                                    fontWeight: 500, 
                                    marginBottom: '4px',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}>
                                    {item.prompt && item.prompt[0] ? item.prompt[0] : 'Untitled Project'}
                                </div>
                                <div style={{ fontSize: '12px', color: '#999' }}>
                                    {new Date(item.updatedAt || item.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
