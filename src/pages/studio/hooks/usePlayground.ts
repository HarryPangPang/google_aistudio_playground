import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Import useLocation and useNavigate
import { api } from '../../../services/api';
import { files as initialFiles } from '../../../fs/virtualFs';
import { DEFAULT_PLATFORM, type Platform, type Model } from '../../../config/platforms';

export const MODEL_OPTIONS = [
    {
        label: 'Gemini 3 Flash Preview',
        value: 1,
    },
    {
        label: 'Gemini 3 Pro Preview',
        value: 2,
    },
    {
        label: 'Gemini 2.5 Pro',
        value: 3,
    },
    {
        label: 'Gemini 2.5 Flash',
        value: 4,
    },
];
export const DEFAULT_MODEL = MODEL_OPTIONS[0];

export function usePlayground() {
    const location = useLocation(); // Hook for location
    const navigate = useNavigate(); // Hook for navigation
    const [deployUrl, setDeployUrl] = useState('');
    const [appId, setAppId] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isDeploying, setIsDeploying] = useState(false);
    const [chatContent, setChatContent] = useState('');
    const [prompt, setPrompt] = useState('');
    const [platform, setPlatform] = useState<Platform>(DEFAULT_PLATFORM);
    const [model, setModel] = useState(DEFAULT_MODEL);
    const [isGenerating, setIsGenerating] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState('');
    const [showDeployConfirm, setShowDeployConfirm] = useState(false);
    const [pendingDeployAppId, setPendingDeployAppId] = useState('');

    // Keep files state for deployment/download
    // Initialize with default template to ensure preview works out of the box
    const [files, setFiles] = useState<Record<string, string>>(initialFiles);

    const handleFileChange = (path: string, content: string) => {
        setFiles(prev => ({
            ...prev,
            [path]: content
        }));
    };

    const initHistory = async (driveid: string) => {
        try {
            const history = JSON.parse(localStorage.getItem('chat_history') || '[]');
            const item = history.find((i: any) => i.driveid === driveid || i.id === driveid);
            if (item && item.chatContent) {
                setChatContent(item.chatContent);

                // 兼容旧数据格式：model 可能是 number 或 {label, value}
                if (item.model) {
                    if (typeof item.model === 'object' && item.model.label && item.model.value !== undefined) {
                        setModel(item.model);
                    } else if (typeof item.model === 'number') {
                        const foundModel = MODEL_OPTIONS.find(m => m.value === item.model);
                        setModel(foundModel || DEFAULT_MODEL);
                    } else {
                        setModel(DEFAULT_MODEL);
                    }
                } else {
                    setModel(DEFAULT_MODEL);
                }

                // 恢复平台信息（如果有）
                if (item.platformId) {
                    const { getPlatformById } = await import('../../../config/platforms');
                    const savedPlatform = getPlatformById(item.platformId);
                    if (savedPlatform) {
                        setPlatform(savedPlatform);
                    }
                }

                return;
            }
        } catch (e) {
            console.warn('Failed to read from local storage', e);
        }

        try {
            const chatData: any = await api.getChatContent(driveid);
            if (chatData && chatData.chatDomContent) {
                setChatContent(chatData.chatDomContent);
            }
        } catch (chatErr) {
            alert('Failed to load chat content, reloading...');
            console.warn('Failed to load chat content:', chatErr);
        }
    };

    const initApp = async () => {
        // Read params from the current location (more reliable in React Router context)
        const params = new URLSearchParams(location.search);
        const driveId = params.get('driveid');
        const legacyId = params.get('id');

        const targetId = driveId || legacyId;

        // Force reset state every time initApp runs (URL changes)
        setAppId('');
        setPendingDeployAppId('');
        setChatContent('');
        setFiles(initialFiles);
        setPrompt('');
        setPlatform(DEFAULT_PLATFORM);
        setModel(DEFAULT_MODEL);

        if (targetId) {
            setAppId(targetId);
            setPendingDeployAppId(targetId);
            try {
                // If backend supports returning files...
                console.log('targetId', targetId);
                await initHistory(targetId);
            } catch (err: any) {
                console.error('Failed to load app:', err);
            }
        }
    };

    useEffect(() => {
        initApp();
    }, [location.search]);


    const handleSave = async () => {
        setIsSaving(true);
        try {
            await api.saveApp(appId, files);
        } catch (err: any) {
            console.error('Save error:', err);
            alert('Save failed: ' + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeploy = async (id = appId) => {
        setIsDeploying(true);
        setDeployUrl('');
        const driveid = appId || id;
        try {
            const data: any = await api.deploywithcode({ id: driveid });
            const url = `${window.location.origin}/${data.url}`;
            setDeployUrl(url);
            afterDeploy(url, driveid);

        } catch (err: any) {
            console.error('Deploy error:', err);
            alert('Deploy failed: ' + err.message);
        } finally {
            setIsDeploying(false);
            setLoadingStatus('');
        }
    };

    const afterDeploy = (url, driveid) => {
        // Update project with deploy URL
        try {
            const history = JSON.parse(localStorage.getItem('chat_history') || '[]');
            const projectIndex = history.findIndex((item: any) =>
                item.driveid === driveid || item.id === driveid
            );
            if (projectIndex !== -1) {
                history[projectIndex] = {
                    ...history[projectIndex],
                    deployUrl: url,
                    status: 'deployed',
                    updatedAt: Date.now()
                };
                localStorage.setItem('chat_history', JSON.stringify(history));
            }
        } catch (e) {
            console.error('Failed to update deploy URL:', e);
        }
        
        // 结束部署状态
        window.open(url, '_blank');
        setIsDeploying(false);
        setLoadingStatus('');
        setIsGenerating(false);
    }

    const saveToHistory = (id: string, currentPrompt: string, chatContent: string, selectedModel: number) => {
        try {
            const history = JSON.parse(localStorage.getItem('chat_history') || '[]');
            let existingIndex = -1;

            if (id) {
                existingIndex = history.findIndex((item: any) =>
                    item.driveid === id || item.id === id
                );
            }

            if (existingIndex !== -1) {
                const item = history[existingIndex];
                const prompts = Array.isArray(item.prompt) ? item.prompt : [item.prompt];
                prompts.push(currentPrompt);

                const updatedItem = {
                    ...item,
                    prompt: prompts,
                    title: prompts[0], // 使用第一条 prompt 作为标题
                    chatContent: chatContent,
                    model: {
                        label: model.label,
                        value: selectedModel
                    },
                    platformId: platform.id,
                    updatedAt: Date.now()
                };

                history.splice(existingIndex, 1);
                history.unshift(updatedItem);
            } else {
                const newRecord = {
                    id: id || `chat-${Date.now()}`,
                    driveid: id || '',
                    type: 'ai-chat',
                    platformId: platform.id,
                    title: currentPrompt,
                    prompt: [currentPrompt],
                    chatContent: chatContent,
                    model: {
                        label: model.label,
                        value: selectedModel
                    },
                    status: 'draft',
                    createdAt: Date.now()
                };
                history.unshift(newRecord);
            }
            localStorage.setItem('chat_history', JSON.stringify(history));
        } catch (e) {
            console.error('Failed to save history:', e);
        }
    };

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        let driveid = appId;
        const currentPrompt = prompt;
        setPrompt('');
        setIsGenerating(true);
        setLoadingStatus('creating');
        setDeployUrl('');
        try {
            if (!appId) {
                const res: any = await api.initChatContent(currentPrompt, model);
                const chatDomContent = res?.data?.chatDomContent || res?.data?.chatDomContent || '';
                driveid = res?.data?.driveid || res?.driveid || '';
                const deployUrl = `${window.location.origin}/${res.url}`;
                setChatContent(chatDomContent);
                setAppId(driveid);
                setPendingDeployAppId(driveid);
                setDeployUrl(deployUrl);
                saveToHistory(driveid, currentPrompt, chatDomContent, model?.value);
            } else {
                const res: any = await api.sendChatMsg({
                    prompt: currentPrompt,
                    driveid: appId,
                    model: model
                });
                const deployUrl = `${window.location.origin}/${res.url}`;
                const chatDomContent = res?.chatDomContent || '';
                setDeployUrl(deployUrl);
                setChatContent(chatDomContent);
                setPendingDeployAppId(appId);
                saveToHistory(appId, currentPrompt, chatDomContent, model.value);
            }
            // 暂时隐藏
            // setLoadingStatus('');
            // setIsGenerating(false);
            // setShowDeployConfirm(true); 
            // 先改成直接部署
            setIsGenerating(true)
            setLoadingStatus('deploying');
            setIsDeploying(true);
            console.log('Auto deploying for appId:', driveid);
            afterDeploy(deployUrl, driveid);

        } catch (error) {
            console.error('Failed to send chat message: ', error);
            setLoadingStatus('');
            setIsGenerating(false);
        }
    };

    const handleDownload = async () => {
        try {
            const { default: JSZip } = await import(/* @vite-ignore */ 'https://esm.sh/jszip@3.10.1');
            const zip = new JSZip();

            zip.file("package.json", JSON.stringify({
                "name": "react-playground-export",
                "version": "0.0.0",
                "type": "module",
                "scripts": { "dev": "vite", "build": "vite build", "preview": "vite preview" },
                "dependencies": { "react": "^19.2.3", "react-dom": "^19.2.3" },
                "devDependencies": { "@types/react": "^19.0.0", "@types/react-dom": "^19.0.0", "@vitejs/plugin-react": "^4.2.1", "typescript": "^5.2.2", "vite": "^5.0.0" }
            }, null, 2));

            zip.file("vite.config.ts", `import { defineConfig } from 'vite'; import react from '@vitejs/plugin-react'; import path from 'path'; export default defineConfig({ plugins: [react()], resolve: { alias: { '@': path.resolve(__dirname, './src') } } });`);
            zip.file("tsconfig.json", JSON.stringify({ "compilerOptions": { "target": "ES2020", "useDefineForClassFields": true, "lib": ["ES2020", "DOM", "DOM.Iterable"], "module": "ESNext", "skipLibCheck": true, "moduleResolution": "bundler", "allowImportingTsExtensions": true, "resolveJsonModule": true, "isolatedModules": true, "noEmit": true, "jsx": "react-jsx", "strict": true, "paths": { "@/*": ["./src/*"] } }, "include": ["src"] }, null, 2));
            zip.file("index.html", `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>React App</title><script src="https://cdn.tailwindcss.com"></script></head><body><div id="root"></div><script type="module" src="/src/index.tsx"></script></body></html>`);

            const src = zip.folder("src");
            Object.entries(files).forEach(([path, content]) => {
                const cleanPath = path.startsWith('/') ? path.slice(1) : path;
                src.file(cleanPath, content);
            });

            const content = await zip.generateAsync({ type: "blob" });
            const url = URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = "project-export.zip";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Download failed:', err);
            alert('Download failed.');
        }
    };

    const handleConfirmDeploy = (confirmed: boolean) => {
        setShowDeployConfirm(false);
        if (confirmed) {
            setLoadingStatus('deploying');
            setIsDeploying(true);
            handleDeploy();
            return;
        }
        setLoadingStatus('');
        setIsGenerating(false);
    };

    // Updated: use navigate instead of pushState
    const startNewProject = () => {
        // Reset local state immediately
        setAppId('');
        setPendingDeployAppId('');
        setChatContent('');
        setFiles(initialFiles);
        setPrompt('');
        setPlatform(DEFAULT_PLATFORM);
        setModel(DEFAULT_MODEL);

        // Update URL, which will trigger useEffect -> initApp -> double ensure reset
        navigate('/');
    };

    const handleImport = async (url: string, file?: File): Promise<void> => {
        setLoadingStatus('importing');
        try {
            let data: any;
            let deployType: 'url' | 'zip' = 'url';
            let sourceUrl: string | undefined = url;

            if (file) {
                data = await api.importFromFile(file);
                deployType = 'zip';
                sourceUrl = undefined;
            } else {
                data = await api.importFromUrl(url);
                deployType = 'url';
            }

            const deployUrl = `${window.location.origin}/${data.url}`;
            setDeployUrl(deployUrl);
            // Save to history
            try {
                const history = JSON.parse(localStorage.getItem('chat_history') || '[]');
                const newProject = {
                    id: `deploy-${Date.now()}`,
                    type: deployType === 'zip' ? 'zip-deploy' : 'url-deploy',
                    platformId: platform.id,
                    title: file ? file.name : url,
                    deployUrl: deployUrl,
                    deployType: deployType,
                    sourceUrl: sourceUrl,
                    status: 'deployed',
                    createdAt: Date.now(),
                };
                history.unshift(newProject);
                localStorage.setItem('chat_history', JSON.stringify(history));
            } catch (e) {
                console.error('Failed to save deploy history:', e);
            }

            setLoadingStatus('');
        } catch (err: any) {
            console.error('Import error:', err);
            setLoadingStatus('');
            throw err; // 抛出错误让 ImportModal 捕获
        }
    };

    return {
        deployUrl,
        setDeployUrl,
        appId,
        isSaving,
        isDeploying,
        chatContent,
        prompt,
        setPrompt,
        platform,
        setPlatform,
        model,
        setModel,
        modelOptions: MODEL_OPTIONS,
        isGenerating,
        loadingStatus,
        showDeployConfirm,
        pendingDeployAppId,
        handleSave,
        handleDeploy,
        handleGenerate,
        handleDownload,
        handleConfirmDeploy,
        files,
        handleFileChange,
        startNewProject,
        handleImport
    };
}
