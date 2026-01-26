import React, { useState, useEffect } from 'react';
import MonacoEditor from '../../../editor/MonacoEditor';
import PreviewIframe from '../../../runner/PreviewIframe';
import { bundleFiles } from '../../../utils/bundler';
import { useI18n } from '../../../context/I18nContext';
import './css/WorkspacePanel.scss';

interface WorkspacePanelProps {
    files: Record<string, string>;
    onFileChange: (path: string, content: string) => void;
}

export const WorkspacePanel: React.FC<WorkspacePanelProps> = ({ files, onFileChange }) => {
    const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
    const [previewContent, setPreviewContent] = useState('');
    const [refreshKey, setRefreshKey] = useState(0);
    const { $l } = useI18n();

    // Hardcoded for now, but should select from file tree in future
    const activeFile = 'App.tsx'; 
    
    useEffect(() => {
        updatePreview();
    }, [files, refreshKey]);

    const updatePreview = async () => {
        try {
            const html = await bundleFiles(files);
            setPreviewContent(html);
        } catch (e) {
            console.error("Failed to generate preview", e);
        }
    };

    return (
        <div className="workspace-panel">
            <div className="workspace-header">
                <button 
                    className={`tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('preview')}
                >
                    {$l('common.preview')}
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'code' ? 'active' : ''}`}
                    onClick={() => setActiveTab('code')}
                >
                    {$l('common.code')}
                </button>

                <button 
                    className="refresh-btn"
                    onClick={() => setRefreshKey(k => k + 1)}
                    title={$l('studio.preview.refreshTooltip')}
                >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>refresh</span>
                </button>
            </div>

            <div className="workspace-content">
                <div className={`preview-container ${activeTab !== 'preview' ? 'hidden' : ''}`}>
                    <PreviewIframe html={previewContent} />
                </div>
                <div className={`editor-container ${activeTab !== 'code' ? 'hidden' : ''}`}>
                    {/* We only show App.tsx for now for simplicity */}
                    <MonacoEditor
                        path={activeFile}
                        code={files[activeFile] || ''}
                        language="typescript"
                        onChange={(val) => onFileChange(activeFile, val)}
                    />
                </div>
            </div>
        </div>
    );
};
