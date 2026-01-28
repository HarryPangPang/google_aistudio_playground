import React from 'react';
import { useI18n } from '../../../context/I18nContext';
import './css/ChatArea.scss';
interface ChatAreaProps {
    chatContent: string;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ chatContent }) => {
    const { $l } = useI18n();
    return (
        <div className="ai-studio-chat-area">
            <div className="chat-content-container">
                {chatContent ? (
                    <div dangerouslySetInnerHTML={{ __html: chatContent }} />
                ) : (
                    <div className="empty-state-container">
                        <div style={{ fontSize: '48px' }}>✨</div>
                        <div style={{ fontSize: '16px', fontWeight: 500 }}>{$l('studio.chat.emptyState')}</div>
                    </div>
                )}
            </div>
        </div>
    );
};
