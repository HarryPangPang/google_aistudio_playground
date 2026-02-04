import React from 'react';
import { Sandpack, SandpackFiles } from '@codesandbox/sandpack-react';
import './SandpackPreview.scss';

interface SandpackPreviewProps {
    files: Record<string, string> | null;
    isLoading: boolean;
}

export const SandpackPreview: React.FC<SandpackPreviewProps> = ({ files, isLoading }) => {
    // 如果正在加载，显示 loading 状态
    if (isLoading) {
        return (
            <div className="sandpack-preview loading">
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                    <p>生成代码中...</p>
                </div>
            </div>
        );
    }

    // 如果没有文件，显示空状态
    if (!files || Object.keys(files).length === 0) {
        return (
            <div className="sandpack-preview empty">
                <div className="empty-state">
                    <div className="empty-icon">{'</>'}</div>
                    <p>在左侧输入提示开始生成代码</p>
                    <p className="empty-hint">生成的代码将在此处实时预览</p>
                </div>
            </div>
        );
    }

    // 转换文件格式为 Sandpack 需要的格式
    const sandpackFiles: SandpackFiles = {};
    for (const [path, content] of Object.entries(files)) {
        // 确保路径以 / 开头
        const normalizedPath = path.startsWith('/') ? path : `/${path}`;
        sandpackFiles[normalizedPath] = {
            code: content
        };
    }

    // 从 package.json 中提取依赖（如果存在）
    let dependencies: Record<string, string> = {
        "react": "^19.0.0",
        "react-dom": "^19.0.0"
    };

    if (files['package.json']) {
        try {
            const packageJson = JSON.parse(files['package.json']);
            if (packageJson.dependencies) {
                dependencies = { ...dependencies, ...packageJson.dependencies };
            }
        } catch (e) {
            console.error('Failed to parse package.json:', e);
        }
    }

    return (
        <div className="sandpack-preview">
            <Sandpack
                template="react-ts"
                files={sandpackFiles}
                theme="dark"
                options={{
                    showNavigator: true,
                    showTabs: false,
                    showLineNumbers: false,
                    showInlineErrors: true,
                    wrapContent: true,
                    editorHeight: '100%',
                    editorWidthPercentage: 0,  // 隐藏编辑器，只显示预览
                    activeFile: '/src/App.tsx'
                }}
                customSetup={{
                    dependencies
                }}
            />
        </div>
    );
};
