import React from 'react';
import { usePlayground } from './hooks/usePlayground';
import { Header } from './components/Header';
import { ChatArea } from './components/ChatArea';
import { InputArea } from './components/InputArea';
import { LoadingOverlay } from './components/LoadingOverlay';
import { DeploymentModal } from './components/DeploymentModal';
import { DeployConfirmModal } from './components/DeployConfirmModal';
import { useLayout } from '../../context/LayoutContext';
import './Studio.scss';

const Playground: React.FC = () => {
    const { toggleSidebar } = useLayout();
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
        handleConfirmDeploy,
        startNewProject // Add this
    } = usePlayground();

    return (
        <div className="playground-container">
            <Header
                isSaving={isSaving}
                isDeploying={isDeploying}
                chatContent={chatContent}
                appId={pendingDeployAppId || ''}
                onSave={handleSave}
                onDownload={handleDownload}
                onDeploy={handleDeploy}
                onMenuClick={toggleSidebar}
                onNewChat={startNewProject} // Pass this prop
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
