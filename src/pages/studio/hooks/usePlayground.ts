import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Import useLocation and useNavigate
import { api } from '../../../services/api';
import { files as initialFiles } from '../../../fs/virtualFs';

const MODEL_OPTIONS = [
    // {
    //     label: 'Gemini 3 Flash Preview',
    //     value: 1,   
    // },
    {
        label: 'Gemini 3 Pro Preview',
        value: 2,   
    },
    // {
    //     label: 'Gemini 2.5 Pro',
    //     value: 3,   
    // },
    // {
    //     label: 'Gemini 2.5 Flash',
    //     value: 4,   
    // },
];
const DEFAULT_MODEL = MODEL_OPTIONS[0];

export function usePlayground() {
    const location = useLocation(); // Hook for location
    const navigate = useNavigate(); // Hook for navigation
    const [deployUrl, setDeployUrl] = useState('');
    const [appId, setAppId] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isDeploying, setIsDeploying] = useState(false);
    const [chatContent, setChatContent] = useState('');
    const [prompt, setPrompt] = useState('');
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
            const item = history.find((i: any) => i.driveid === driveid);
            if (item && item.chatContent) {
                setChatContent(item.chatContent);
                setModel(item.model || DEFAULT_MODEL);
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

    // Re-run initApp whenever the URL search params change
    useEffect(() => {
        initApp();
    }, [location.search]);

    // ... (rest of the functions: handleSave, handleDeploy, saveToHistory, handleGenerate, handleDownload, handleConfirmDeploy)

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

    const handleDeploy = async () => {
        setIsDeploying(true);
        setDeployUrl('');
        try {
            const data: any = await api.deploywithcode({ id: appId });
            const url = `${window.location.origin}/${data.url}`;
            setDeployUrl(url);
        } catch (err: any) {
            console.error('Deploy error:', err);
            alert('Deploy failed: ' + err.message);
        } finally {
            setIsDeploying(false);
            setLoadingStatus('');
        }
    };

    const saveToHistory = (id: string, currentPrompt: string, chatContent: string, selectedModel: number) => {
        try {
            const history = JSON.parse(localStorage.getItem('chat_history') || '[]');
            let existingIndex = -1;
            
            if (id) {
                existingIndex = history.findIndex((item: any) => item.driveid === id);
            }

            if (existingIndex !== -1) {
                const item = history[existingIndex];
                const prompts = Array.isArray(item.prompt) ? item.prompt : [item.prompt];
                prompts.push(currentPrompt);

                const updatedItem = {
                    ...item,
                    prompt: prompts,
                    chatContent: chatContent,
                    model: selectedModel,
                    updatedAt: Date.now()
                };
                
                history.splice(existingIndex, 1);
                history.unshift(updatedItem);
            } else {
                const newRecord = {
                    driveid: id || '',
                    id: id || '',
                    filename: '',
                    filepath: '',
                    prompt: [currentPrompt],
                    chatContent: chatContent,
                    model: selectedModel,
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

        const currentPrompt = prompt;
        setPrompt(''); 
        setIsGenerating(true);
        setLoadingStatus('creating');
        setDeployUrl('');
        try {
            if (!appId) {
                const res: any = await api.initChatContent(currentPrompt, model.value);
                const chatDomContent = res?.data?.chatDomContent || res?.data?.chatDomContent || '';
                const driveid = res?.data?.driveid || res?.driveid || '';
                setChatContent(chatDomContent);
                setAppId(driveid);
                setPendingDeployAppId(driveid);

                saveToHistory(driveid, currentPrompt, chatDomContent, model?.value);
            } else {
                const res: any = await api.sendChatMsg({
                    prompt: currentPrompt,
                    driveid: appId,
                    model: model.value
                });
                const chatDomContent = res?.chatDomContent || '';
                setChatContent(chatDomContent);
                setPendingDeployAppId(appId);
                saveToHistory(appId, currentPrompt, chatDomContent, model.value);
            }

            setLoadingStatus('');
            setIsGenerating(false);
            setShowDeployConfirm(true);

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
        setModel(DEFAULT_MODEL);
        
        // Update URL, which will trigger useEffect -> initApp -> double ensure reset
        navigate('/');
    };

    const handleImport = async (url: string) => {
        setLoadingStatus('importing');
        try {
            const data: any = await api.importFromUrl(url);
            const _url = `${window.location.origin}/${data.url}`;
            setDeployUrl(_url);

            setLoadingStatus('');
        } catch (err: any) {
            console.error('Import error:', err);
            alert('Import failed: ' + err.message);
            setLoadingStatus('');
        }
    };

    const handleImportFile = async (file: File) => {
        setLoadingStatus('importing');
        try {
            const data: any = await api.importFromFile(file);
            const _url = `${window.location.origin}/${data.url}`;
            setDeployUrl(_url);

            setLoadingStatus('');
        } catch (err: any) {
            console.error('Import file error:', err);
            alert('Import file failed: ' + err.message);
            setLoadingStatus('');
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
        handleImport,
        handleImportFile
    };
}
