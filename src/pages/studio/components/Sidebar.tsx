import React from 'react';
import './css/Sidebar.scss';

interface SidebarProps {
    visible: boolean;
    history: any[];
    onSelect: (id: string) => void;
    onClose: () => void;
    onNewChat: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ visible, history, onSelect, onClose, onNewChat }) => {
    return (
        <div className={`studio-sidebar ${visible ? 'visible' : ''}`}>
            <div className="sidebar-header">
                <h2>History</h2>
                <button 
                    onClick={onClose}
                    className="close-btn"
                >
                    ×
                </button>
            </div>

            <div className="new-chat-container">
                 <button
                    onClick={() => {
                        onNewChat();
                        onClose();
                    }}
                    className="new-chat-btn"
                >
                    + New Chat
                </button>
            </div>

            <div className="history-list">
                {history.length === 0 ? (
                    <div className="empty-history">
                        No history yet
                    </div>
                ) : (
                    <div className="history-items">
                        {history.map((item, index) => (
                            <div
                                key={item.driveid || index}
                                onClick={() => {
                                    onSelect(item.driveid);
                                    onClose();
                                }}
                                className="history-item"
                            >
                                <div className="item-title">
                                    {item.prompt && item.prompt[0] ? item.prompt[0] : 'Untitled Project'}
                                </div>
                                <div className="item-date">
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
