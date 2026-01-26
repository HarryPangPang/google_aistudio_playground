import React from 'react';
import './css/ChatArea.scss';
interface ChatAreaProps {
    chatContent: string;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ chatContent }) => {
    return (
        <div className="ai-studio-chat-area">
            <div style={{
                width: '100%',
                maxWidth: '800px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px'
            }}>
                {chatContent ? (
                    <div dangerouslySetInnerHTML={{ __html: chatContent }} />
                ) : (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '60vh',
                        color: '#888',
                        gap: '16px'
                    }}>
                        <div style={{ fontSize: '48px' }}>✨</div>
                        <div style={{ fontSize: '16px', fontWeight: 500 }}>What would you like to build today?</div>
                    </div>
                )}
            </div>
        </div>
    );
};
