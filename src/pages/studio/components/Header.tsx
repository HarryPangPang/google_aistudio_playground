import React, { useEffect, useRef, useState } from 'react';
import { useI18n } from '../../../context/I18nContext';
import './css/Header.scss';

interface HeaderProps {
    isSaving: boolean;
    isDeploying: boolean;
    chatContent: string;
    appId: string;
    onSave: () => void;
    onDownload: () => void;
    onDeploy: () => void;
    onMenuClick: () => void;
    onNewChat?: () => void; // Add optional prop
}

export const Header: React.FC<HeaderProps> = ({ isSaving, isDeploying, chatContent, appId, onSave, onDownload, onDeploy, onMenuClick, onNewChat }) => {
    const canDeploy = !!appId && chatContent.length > 0;
    const { $l } = useI18n();

    return (
        <div className="studio-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                    onClick={onMenuClick}
                    className="history-toggle-btn"
                    title={$l('menu.toggleMenu')}
                >
                    ☰
                </button>
            </div>

            <div className="header-actions">
                <button
                    onClick={onDeploy}
                    disabled={isDeploying || !canDeploy}
                    className="action-btn primary"
                    title={!canDeploy ? $l('studio.header.deployTooltip') : $l('studio.header.deployTitle')}
                >
                    {isDeploying ? (
                        <>
                            <span className="spinner"></span>
                            {$l('common.deploying')}
                        </>
                    ) : (
                        <>
                            <span className="icon">🚀</span>
                            {$l('common.deploy')}
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};
