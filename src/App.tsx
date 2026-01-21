import { useState, useEffect, useRef, useCallback } from 'react';
import PreviewIframe from './runner/PreviewIframe';
import MonacoEditor from './editor/MonacoEditor';
import FileExplorer from './FileExplorer';
import { files as initialFiles } from './fs/virtualFs';
import { createHtml } from './template/previewHtml';
import tailwindRaw from './lib/tailwindcss.js?raw';
import { api } from './services/api';
import './index.css';
export default function App() {

  const [html, setHtml] = useState('');
  const [error, setError] = useState('');
  const [isBuilding, setIsBuilding] = useState(false);
  const [selectedFile, setSelectedFile] = useState('App.tsx');
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');
  
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployUrl, setDeployUrl] = useState('');
  const [appId, setAppId] = useState('1');
  const [isSaving, setIsSaving] = useState(false);
  const [chatContent, setChatContent] = useState('');
  // Initialize with virtualFs files
  const [files, setFiles] = useState<Record<string, string>>({});
  const initApp = async () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id') || appId;
    if (!id) {
        if (Object.keys(files).length === 0) {
            //  setFiles(initialFiles);
        }
        return;
    }
    setAppId(id);
    try {
        const data: any = await api.getApp(id);
        if (data.success && data.data && data.data.files) {
            setFiles(data.data.files);
        }
    } catch (err: any) {
      alert('Failed to load app:' + err.message);
        console.error('Failed to load app:', err);
    }
};

const initChatContent = async () => {
  setChatContent('Loading...');
  const data: any = await api.getChatContent();
  if (data?.chatDomContent) {
    setChatContent(data.chatDomContent);
  } else {
    setChatContent('Failed to load chat content');
  }
}

  useEffect(() => {
    // initChatContent();
    initApp();
  }, []);

  // Auto-build when files change (debounced via scheduleBuild)
  useEffect(() => {
     scheduleBuild();
  }, [files]);


  const handleSave = async () => {
    setIsSaving(true);
    try {
        const id = appId;
        await api.saveApp(id, files);
        
        setAppId(id);
        alert('Saved successfully!');
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
        const payload: any = { files };
        if (appId) {
            payload.appId = appId;
        }

        const data: any = await api.deploywithcode(payload);
        
        // const url = `${window.location.origin}/${data.url}`;
        const url = `http://localhost:1234/${data.url}`;
        setDeployUrl(url);
    } catch (err: any) {
        console.error('Deploy error:', err);
        alert('Deploy failed: ' + err.message);
    } finally {
        setIsDeploying(false);
    }
  };

  const monacoRef = useRef<any>(null);
  const buildTimerRef = useRef<number | null>(null);
  const generatedUrlsRef = useRef<string[]>([]);

  const tailwindBlobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    // Create Blob URL from imported local tailwindcss
    const blob = new Blob([tailwindRaw], { type: 'application/javascript' });
    tailwindBlobUrlRef.current = URL.createObjectURL(blob);
    
    return () => {
        if (tailwindBlobUrlRef.current) URL.revokeObjectURL(tailwindBlobUrlRef.current);
    };
  }, []);

  // Sync virtual files to Monaco models
    const syncModels = useCallback((monaco: any) => {
    console.log('[syncModels] Starting to sync models for files:', Object.keys(files));
    
    Object.entries(files).forEach(([path, content]) => {
      // Create URI with explicit root slash to ensure file:/// scheme works correctly
      // path is like "App.tsx" or "components/GameEngine.tsx"
      // uri becomes "file:///App.tsx"
      const uri = monaco.Uri.from({ scheme: 'file', path: '/' + path });
      console.log('[syncModels] Creating/checking model for:', path, '-> URI:', uri.toString());
      
      let model = monaco.editor.getModel(uri);
      
      // Handle CSS files
      if (path.endsWith('.css')) {
          const dtsUri = monaco.Uri.from({ scheme: 'file', path: '/' + path + '.d.ts' });
          if (!monaco.editor.getModel(dtsUri)) {
              monaco.editor.createModel("declare const content: any; export default content;", 'typescript', dtsUri);
              console.log('[syncModels] Created CSS .d.ts for:', path);
          }
      }

      if (!model) {
        const lang = path.endsWith('.tsx') || path.endsWith('.ts') ? 'typescript' : 
                     path.endsWith('.css') ? 'css' : 
                     path.endsWith('.html') ? 'html' : 'javascript';
        model = monaco.editor.createModel(content, lang, uri);
        console.log('[syncModels] Created new model:', path, 'lang:', lang);
      } else {
        if (model.getValue() !== content) {
          model.setValue(content);
          console.log('[syncModels] Updated existing model:', path);
        }
      }
    });
    
    // Log all models after sync
    const allModels = monaco.editor.getModels();
    console.log('[syncModels] All models after sync:', allModels.map((m: any) => m.uri.toString()));
    
    // 添加通用的模块声明，防止找不到模块错误
    // 特别是对于 CSS 和可能的其他资源
    // 也可以手动添加一个 global.d.ts
    const globalDtsUri = monaco.Uri.parse('file:///global.d.ts');
    if (!monaco.editor.getModel(globalDtsUri)) {
        monaco.editor.createModel(`
            declare module '*.css' {
                const content: any;
                export default content;
            }
            declare module '*.svg';
            declare module '*.png';
            declare module '*.jpg';
        `, 'typescript', globalDtsUri);
    }

  }, []);

  const build = useCallback(async () => {
    const monaco = monacoRef.current;
    if (!monaco) return;
    
    setIsBuilding(true);

    try {
      // Clear old URLs
      generatedUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
      generatedUrlsRef.current = [];

      const importMap = {
        imports: {
          "tailwindcss": "https://cdn.tailwindcss.com",
          "react": "https://esm.sh/react@19",
          "react-dom/client": "https://esm.sh/react-dom@19/client",
          "react/jsx-runtime": "https://esm.sh/react@19/jsx-runtime",
        } as Record<string, string>
      };

      const workerGetter = await monaco.languages.typescript.getTypeScriptWorker();
      const normalizePathKey = (value: string) => value.startsWith('/') ? value.slice(1) : value;
      
      for (const [path, content] of Object.entries(files)) {
        if (path.endsWith('.css')) {
             const cssJs = `
               const style = document.createElement('style');
               style.textContent = ${JSON.stringify(content)};
               document.head.appendChild(style);
             `;
             const blob = new Blob([cssJs], { type: 'application/javascript' });
             const url = URL.createObjectURL(blob);
             generatedUrlsRef.current.push(url);
            //  importMap.imports[`@${path}`] = url;
            const pathKey = normalizePathKey(path);
            importMap.imports[`@${pathKey}`] = url;
            importMap.imports[`@/${pathKey}`] = url;
             continue;
        }

        if (!path.endsWith('.ts') && !path.endsWith('.tsx') && !path.endsWith('.js') && !path.endsWith('.jsx')) continue;

        const uri = monaco.Uri.from({ scheme: 'file', path: '/' + path });
        
        let model = monaco.editor.getModel(uri);
        if (!model) {
             model = monaco.editor.createModel(content, 'typescript', uri);
        }
        // Ensure model content is synced from files object (in case we didn't use the editor)
        if (path !== selectedFile && model.getValue() !== content) {
             model.setValue(content);
        }

        const client = await workerGetter(uri);
        const output = await client.getEmitOutput(uri.toString());
        
        if (output.outputFiles.length === 0) continue;

        let jsCode = output.outputFiles[0].text;

        // Transform relative imports
        // Improved Regex to handle ./ and ../
        jsCode = jsCode.replace(/from\s+['"](\.[^'"]+)['"]/g, (match, p1) => {
            // p1 is relative path (e.g. ./App, ../types)
            
            // Get current file's directory
            const currentDir = path.substring(0, path.lastIndexOf('/'));
            
            // Resolve path
            const stack = currentDir.split('/').filter(Boolean);
            const parts = p1.split('/');
            
            for (const part of parts) {
                if (part === '.') continue;
                if (part === '..') {
                    stack.pop();
                } else {
                    stack.push(part);
                }
            }
            
            // Reconstruct path. Since we are at root, stack might be empty or ['components']
            let resolvedPath = stack.length > 0 ? '/' + stack.join('/') : '';
            const normalizedResolvedPath = normalizePathKey(resolvedPath);
            
            // Example: from ./App (in /index.tsx)
            // currentDir = '' (empty string from /index.tsx lastIndexOf / is 0)
            // stack = []
            // parts = ['App']
            // stack = ['App']
            // resolvedPath = '/App'
            
            const extensions = ['', '.tsx', '.ts', '.jsx', '.js', '.css', '.json'];
            let foundPath = '';
            
            for (const ext of extensions) {
                if (files[normalizedResolvedPath + ext]) {
                    foundPath = normalizedResolvedPath + ext;
                    break;
                }
                // Try index files
                if (files[normalizedResolvedPath + '/index' + ext]) {
                    foundPath = normalizedResolvedPath + '/index' + ext;
                    break;
                }
            }
            
            if (foundPath) {
                 return `from "@${foundPath}"`; 
            }
            
            // If explicit extension was provided in p1 (e.g. ./App.tsx), resolvedPath is /App.tsx
            // The loop with '' extension will match it.
            
            return `from "@${normalizedResolvedPath}"`; 
        });
        
        // CSS import handling (import './index.css')
        // Regex for side-effect imports
        jsCode = jsCode.replace(/import\s+['"](\.[^'"]+)['"];/g, (match, p1) => {
             const currentDir = path.substring(0, path.lastIndexOf('/'));
             const stack = currentDir.split('/').filter(Boolean);
             const parts = p1.split('/');
             for (const part of parts) {
                if (part === '.') continue;
                if (part === '..') stack.pop();
                else stack.push(part);
             }
             let resolvedPath = '/' + stack.join('/');
             const normalizedResolvedPath = normalizePathKey(resolvedPath);
             
             // Check extensions
             if (files[normalizedResolvedPath]) return `import "@${normalizedResolvedPath}";`;
             if (files[normalizedResolvedPath + '.css']) return `import "@${normalizedResolvedPath}.css";`;
             
             return match;
        });
        
        const blob = new Blob([jsCode], { type: 'application/javascript' });
        const url = URL.createObjectURL(blob);
        generatedUrlsRef.current.push(url);
        
        const pathKey = normalizePathKey(path);
        importMap.imports[`@${pathKey}`] = url;
        importMap.imports[`@/${pathKey}`] = url;
        const pathNoExt = pathKey.replace(/\.(tsx|ts|jsx|js)$/, '');
        importMap.imports[`@${pathNoExt}`] = url;
        importMap.imports[`@/${pathNoExt}`] = url;
      }

      const newHtml = createHtml(importMap, tailwindBlobUrlRef.current);
      setHtml(newHtml);
      setError('');
    } catch (e: any) {
      console.error(e);
      setError(e.message);
    } finally {
      setIsBuilding(false);
    }
  }, [selectedFile, files]);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    monacoRef.current = monaco;
    syncModels(monaco);
    build();
  };

  const scheduleBuild = useCallback(() => {
    if (buildTimerRef.current) {
      window.clearTimeout(buildTimerRef.current);
    }
    buildTimerRef.current = window.setTimeout(() => {
      build();
    }, 500);
  }, [build]);

  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setDeployUrl('');
    try {
      const res: any = await api.sendChatMsg(prompt);
      setChatContent(res?.chatDomContent || '');
      setPrompt('');
    } catch (error) {
      console.error('Failed to send chat message: ', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditorChange = (value: string) => {
    setFiles(prev => ({ ...prev, [selectedFile]: value }));
  };

  const handleFileSelect = (path: string) => {
      setSelectedFile(path);
  };

  return (
    <div style={{display:'flex',height:'100vh'}}>
      {/* Google AI Side Panel */}
      <div style={{
        width: '600px', 
        borderRight: '1px solid #ddd', 
        display: 'flex', 
        flexDirection: 'column',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{
          padding: '10px', 
          borderBottom: '1px solid #ddd', 
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div dangerouslySetInnerHTML={{ __html: chatContent }} />
        </div>
        <div style={{flex: 1, padding: '10px', overflowY: 'auto'}}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            marginBottom: '20px'
          }}>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="输入描述生成代码..."
              style={{
                width: '100%',
                height: '100px',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ced4da',
                resize: 'vertical'
              }}
            />
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              style={{
                padding: '8px',
                backgroundColor: isGenerating ? '#6c757d' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isGenerating ? 'not-allowed' : 'pointer'
              }}
            >
              {isGenerating ? '生成中...' : '生成代码'}
            </button>
          </div>
        </div>
      </div>

      <FileExplorer 
        files={files} 
        selectedFile={selectedFile} 
        onSelect={handleFileSelect} 
      />
      <div style={{flex:1, display: 'flex', flexDirection: 'column', maxWidth: '1000px'}}>
        <div style={{padding: '10px', borderBottom: '1px solid #ddd', display: 'flex', alignItems: 'center', gap: 8}}>
          <div style={{display: 'flex', gap: 6}}>
            <button
              onClick={() => setActiveTab('code')}
              style={{
                padding: '5px 12px',
                cursor: 'pointer',
                backgroundColor: activeTab === 'code' ? '#111' : '#f2f2f2',
                color: activeTab === 'code' ? '#fff' : '#333',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '12px'
              }}
            >
              Code
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              style={{
                padding: '5px 12px',
                cursor: 'pointer',
                backgroundColor: activeTab === 'preview' ? '#111' : '#f2f2f2',
                color: activeTab === 'preview' ? '#fff' : '#333',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '12px'
              }}
            >
              Preview
            </button>
          </div>
           <div style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10}}>
            {activeTab === 'code' && (
              <span style={{fontWeight: 'bold', fontSize: '14px'}}>
                {selectedFile} {isBuilding ? '(building...)' : ''}
              </span>
            )}
            <button 
              onClick={handleSave}
              disabled={isSaving}
              style={{
                  padding: '5px 15px', 
                  cursor: isSaving ? 'not-allowed' : 'pointer', 
                  backgroundColor: '#17a2b8', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px', 
                  marginRight: '10px',
                  opacity: isSaving ? 0.7 : 1
              }}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            <button 
              onClick={handleDeploy}
              disabled={isDeploying}
              style={{
                  padding: '5px 15px', 
                  cursor: isDeploying ? 'not-allowed' : 'pointer', 
                  backgroundColor: '#6f42c1', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px', 
                  marginRight: '10px',
                  opacity: isDeploying ? 0.7 : 1
              }}
            >
              {isDeploying ? 'Deploying...' : 'Deploy'}
            </button>
            <button 
              onClick={async () => {
                try {
                    // Load dependencies dynamically from ESM CDN
                    const { default: JSZip } = await import(/* @vite-ignore */ 'https://esm.sh/jszip@3.10.1');
                    
                    const zip = new JSZip();
                    zip.file("package.json", JSON.stringify({
                        "name": "react-playground-export",
                        "version": "0.0.0",
                        "type": "module",
                        "scripts": {
                            "dev": "vite",
                            "build": "vite build",
                            "preview": "vite preview"
                        },
                        "dependencies": {
                            "react": "^19.2.3",
                            "react-dom": "^19.2.3"
                        },
                        "devDependencies": {
                            "@types/react": "^19.0.0",
                            "@types/react-dom": "^19.0.0",
                            "@vitejs/plugin-react": "^4.2.1",
                            "typescript": "^5.2.2",
                            "vite": "^5.0.0"
                        }
                    }, null, 2));

                    zip.file("vite.config.ts", `
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  }
});
`);

                    zip.file("tsconfig.json", JSON.stringify({
                        "compilerOptions": {
                            "target": "ES2020",
                            "useDefineForClassFields": true,
                            "lib": ["ES2020", "DOM", "DOM.Iterable"],
                            "module": "ESNext",
                            "skipLibCheck": true,
                            "moduleResolution": "bundler",
                            "allowImportingTsExtensions": true,
                            "resolveJsonModule": true,
                            "isolatedModules": true,
                            "noEmit": true,
                            "jsx": "react-jsx",
                            "strict": true,
                            "unusedLocals": false,
                            "unusedParameters": false,
                            "noFallthroughCasesInSwitch": true,
                            "paths": {
                                "@/*": ["./src/*"]
                            }
                        },
                        "include": ["src"]
                    }, null, 2));

                    zip.file("index.html", `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React App</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/index.tsx"></script>
  </body>
</html>
`);

                    const src = zip.folder("src");
                    Object.entries(files).forEach(([path, content]) => {
                        const cleanPath = path.startsWith('/') ? path.slice(1) : path;
                        src.file(cleanPath, content);
                    });

                    const content = await zip.generateAsync({ type: "blob" });
                    
                    // Trigger download manually without file-saver
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
                    alert('Download failed. Check console for details.');
                }
              }}
              style={{padding: '5px 15px', cursor: 'pointer', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', marginRight: '10px'}}
            >
              Download
            </button>
            <button onClick={()=>build()} style={{padding: '5px 15px', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px'}}>▶ Run</button>
          </div>
        </div>
        {error && (
          <div style={{ padding: 10, color: '#b00020', borderBottom: '1px solid #eee', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', whiteSpace: 'pre-wrap' }}>
            {error}
          </div>
        )}
        <div style={{flex: 1}}>
          {activeTab === 'code' ? (
            <MonacoEditor
              key={selectedFile}
              path={`file:///${selectedFile}`}
              language={selectedFile.endsWith('.css') ? 'css' : 'typescript'}
              code={files[selectedFile]}
              onChange={handleEditorChange}
              onMount={(editor, monaco) => {
                  monacoRef.current = monaco;
                  syncModels(monaco);
                  
                  if (!isBuilding && !html) {
                      build();
                  }
              }}
            />
          ) : (
            <PreviewIframe html={html}/>
          )}
        </div>
      </div>
      {deployUrl && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            width: '420px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
          }}>
            <h3 style={{marginTop: 0, marginBottom: '16px', fontSize: '18px', color: '#333'}}>Deployment Ready</h3>
            <p style={{marginBottom: '8px', color: '#666', fontSize: '14px'}}>Your project is deployed. Click below to copy the URL.</p>
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '12px',
              borderRadius: '4px',
              marginBottom: '20px',
              wordBreak: 'break-all',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              fontSize: '13px',
              border: '1px solid #e9ecef',
              color: '#212529',
              cursor: 'pointer'
            }}
            onClick={() => {
                navigator.clipboard.writeText(deployUrl);
                // alert('Copied!');
                const el = document.getElementById('url-display-box');
                if (el) {
                    el.style.backgroundColor = '#d4edda';
                    setTimeout(() => el.style.backgroundColor = '#f8f9fa', 300);
                }
            }}
            id="url-display-box"
            title="Click to copy"
            >
              {deployUrl}
            </div>
            <div style={{display: 'flex', gap: '10px', justifyContent: 'flex-end'}}>
              <button 
                onClick={() => setDeployUrl('')}
                style={{
                  padding: '8px 16px',
                  cursor: 'pointer',
                  backgroundColor: 'white',
                  color: '#495057',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                Close
              </button>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(deployUrl);
                  const btn = document.getElementById('btn-copy-url');
                  if (btn) {
                     const original = btn.innerText;
                     btn.innerText = 'Copied!';
                     setTimeout(() => btn.innerText = original, 2000);
                  }
                }} 
                id="btn-copy-url"
                style={{
                  padding: '8px 16px',
                  cursor: 'pointer',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                Copy
              </button>
              <button 
                onClick={() => window.open(deployUrl, '_blank')}
                style={{
                  padding: '8px 16px',
                  cursor: 'pointer',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                Open
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
