import { useState, useEffect } from 'react';
import { api } from '../../../services/api';

export function usePlayground() {
    const [deployUrl, setDeployUrl] = useState('');
    const [appId, setAppId] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isDeploying, setIsDeploying] = useState(false);
    const [chatContent, setChatContent] = useState('');
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState(''); // 'creating', 'deploying', ''
    const [showDeployConfirm, setShowDeployConfirm] = useState(false);
    const [pendingDeployAppId, setPendingDeployAppId] = useState('');

    // Keep files state for deployment/download, even if not displayed
    const [files, setFiles] = useState<Record<string, string>>({});

    const initChatContent = async () => {
        try {
            const chatData: any = await api.getChatContent();
            if (chatData && chatData.chatDomContent) {
                setChatContent(chatData.chatDomContent);
            }
        } catch (chatErr) {
            console.warn('Failed to load chat content:', chatErr);
        }
    };

    const initApp = async () => {
        const params = new URLSearchParams(window.location.search);
        const driveId = params.get('driveid');
        const legacyId = params.get('id');

        // Priority: driveid > id > new session
        const targetId = driveId || legacyId;

        if (targetId) {
            setAppId(targetId);
            try {
                // 保留代码下次用
                // const data: any = await api.getApp(targetId);
                // if (data.success && data.data && data.data.files) {
                //     setFiles(data.data.files);
                // }
                await initChatContent();
            } catch (err: any) {
                console.error('Failed to load app:', err);
            }
        } else {
            setAppId('');
            setChatContent('');
            setFiles({});
        }
    };

    useEffect(() => {
        initApp();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const id = appId;
            await api.saveApp(id, files);
            // Note: If we are in "New Session" mode, we might want to update the URL here
            // so the user can bookmark it. But per requirements, we just keep it simple.
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
            // Fetch latest files before deploying to ensure we have what was generated
            // let currentFiles = files;
            // try {
            //     const data: any = await api.getApp(appId);
            //     if (data.success && data.data && data.data.files) {
            //         currentFiles = data.data.files;
            //         setFiles(currentFiles);
            //     }
            // } catch (e) {
            //     console.warn("Could not refresh files before deploy, using current state");
            // }

            // const payload: any = { files: currentFiles };
            const payload: any = { id: appId };

            const data: any = await api.deploywithcode(payload);

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

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        const currentPrompt = prompt;
        setPrompt(''); // Clear input immediately
        setIsGenerating(true);
        setLoadingStatus('creating');
        setDeployUrl('');
        try {
            if (!appId) {
                const res: any = await api.initChatContent(currentPrompt);
                const chatDomContent = res?.data?.chatDomContent || res?.data?.chatDomContent || '';
                const driveid = res?.data?.driveid || res?.driveid || '';
                setChatContent(chatDomContent);
                setAppId(driveid);
                setPendingDeployAppId(driveid);
            } else {
                const res: any = await api.sendChatMsg(currentPrompt);
                setChatContent(res?.chatDomContent || '');
                setPendingDeployAppId(appId);
            }

            setLoadingStatus('');
            setIsGenerating(false);
            setShowDeployConfirm(true);

        } catch (error) {
            console.error('Failed to send chat message: ', error);
            setLoadingStatus('');
            setIsGenerating(false);
        } finally {
            if (loadingStatus === 'creating') {
                // If we failed early, clear it. 
            }
        }
    };

    // Reset generating state when deploy finishes or fails
    useEffect(() => {
        if (!isDeploying && loadingStatus === '') {
            setIsGenerating(false);
        }
    }, [isDeploying, loadingStatus]);


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

    return {
        deployUrl,
        setDeployUrl,
        appId,
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
    };
}
