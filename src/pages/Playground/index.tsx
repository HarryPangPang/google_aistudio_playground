import React, { useState, useEffect } from 'react';
import { usePlayground } from './hooks/usePlayground';
import { Header } from './components/Header';
import { ChatArea } from './components/ChatArea';
import { InputArea } from './components/InputArea';
import { LoadingOverlay } from './components/LoadingOverlay';
import { DeploymentModal } from './components/DeploymentModal';
import { DeployConfirmModal } from './components/DeployConfirmModal';
import { Sidebar } from './components/Sidebar';

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
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            backgroundColor: '#fff',
            color: '#1f1f1f'
        }}>
            <Header
                isSaving={isSaving}
                isDeploying={isDeploying}
                onSave={handleSave}
                onDownload={handleDownload}
                onDeploy={handleDeploy}
                onHistoryClick={() => setSidebarVisible(true)}
            />

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
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.3)',
                        zIndex: 900
                    }}
                />
            )}

            <ChatArea chatContent={chatContent} />

            <LoadingOverlay status={loadingStatus} />

            <InputArea
                prompt={prompt}
                setPrompt={setPrompt}
                isGenerating={isGenerating}
                onGenerate={handleGenerate}
            />

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
