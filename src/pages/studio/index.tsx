import React, { useState, useEffect } from 'react';
import { usePlayground } from './hooks/usePlayground';
import { Header } from './components/Header';
import { ChatArea } from './components/ChatArea';
import { InputArea } from './components/InputArea';
import { LoadingOverlay } from './components/LoadingOverlay';
import { DeploymentModal } from './components/DeploymentModal';
import { DeployConfirmModal } from './components/DeployConfirmModal';
import { Sidebar } from './components/Sidebar';
import './Studio.scss';

const Playground: React.FC = () => {
    const {
        deployUrl,
        setDeployUrl,
        isSaving,
        isDeploying,
        chatContent,
        prompt,
        setPrompt,
        isGenerating,
        loadingStatus,
        showDeployConfirm,
        pendingDeployAppId,
        handleSave,
        handleDeploy,
        handleGenerate,
        handleDownload,
        handleConfirmDeploy
    } = usePlayground();

    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [history, setHistory] = useState<any[]>([]);

    useEffect(() => {
        const loadHistory = () => {
            try {
                const storedHistory = JSON.parse(localStorage.getItem('chat_history') || '[]');
                setHistory(storedHistory);
            } catch (e) {
                console.error('Failed to load history:', e);
            }
        };

        if (sidebarVisible) {
            loadHistory();
        }
    }, [sidebarVisible]);

    const handleHistorySelect = (driveid: string) => {
        // Redirect to the selected chat
        window.location.href = `/?driveid=${driveid}`;
    };

    const handleNewChat = () => {
        window.location.href = '/';
    };

    return (
        <div className="playground-container">
            <Header
                isSaving={isSaving}
                isDeploying={isDeploying}
                onSave={handleSave}
                onDownload={handleDownload}
                onDeploy={handleDeploy}
                onHistoryClick={() => setSidebarVisible(true)}
            />

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
                <ChatArea chatContent={chatContent} />
                <InputArea
                    prompt={prompt}
                    setPrompt={setPrompt}
                    isGenerating={isGenerating}
                    onGenerate={handleGenerate}
                />
            </div>

            <Sidebar 
                visible={sidebarVisible}
                history={history}
                onSelect={handleHistorySelect}
                onClose={() => setSidebarVisible(false)}
                onNewChat={handleNewChat}
            />

            {/* Overlay for sidebar */}
            {sidebarVisible && (
                <div 
                    onClick={() => setSidebarVisible(false)}
                    className="sidebar-overlay"
                />
            )}

            <LoadingOverlay status={loadingStatus} />

            <DeploymentModal
                deployUrl={deployUrl}
                onClose={() => setDeployUrl('')}
            />

            <DeployConfirmModal
                visible={showDeployConfirm}
                appId={pendingDeployAppId}
                onConfirm={handleConfirmDeploy}
            />
        </div>
    );
};

export default Playground;
