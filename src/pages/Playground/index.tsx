import React from 'react';
import { usePlayground } from './hooks/usePlayground';
import { Header } from './components/Header';
import { ChatArea } from './components/ChatArea';
import { InputArea } from './components/InputArea';
import { LoadingOverlay } from './components/LoadingOverlay';
import { DeploymentModal } from './components/DeploymentModal';
import { DeployConfirmModal } from './components/DeployConfirmModal';

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
            />

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
