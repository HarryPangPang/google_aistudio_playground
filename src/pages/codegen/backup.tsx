import React, { useState, useEffect, useRef } from 'react';
import { useI18n } from '../../context/I18nContext';
import { api } from '../../services/api';
import { SandpackPreview } from './components/SandpackPreview';
import './CodeGen.scss';
const MOCKdata = {
    "success": true,
    "data": {
        "chatId": "03806cf9-fc39-40ef-9908-3fecea559af3",
        "sessionId": "5a9bca03-0404-4498-8b76-af6de73801d3",
        "fileName": "codegen-03806cf9-fc39-40ef-9908-3fecea559af3-1770212341476",
        "files": [
            "package.json",
            "tsconfig.json",
            "vite.config.ts",
            "index.html",
            "src/index.tsx",
            "src/App.tsx",
            "src/App.css",
            "src/components/Canvas.tsx",
            "src/components/Toolbar.tsx",
            "src/services/aiService.ts"
        ],
        "fileContents": {
            "package.json": "{\n  \"name\": \"react-drawing-board\",\n  \"private\": true,\n  \"version\": \"0.1.0\",\n  \"type\": \"module\",\n  \"scripts\": {\n    \"dev\": \"vite\",\n    \"build\": \"tsc && vite build\",\n    \"preview\": \"vite preview\"\n  },\n  \"dependencies\": {\n    \"react\": \"^19.2.4\",\n    \"react-dom\": \"^19.2.4\",\n    \"@google/genai\": \"^1.39.0\"\n  },\n  \"devDependencies\": {\n    \"@types/node\": \"^22.14.0\",\n    \"@types/react\": \"^19.0.0\",\n    \"@types/react-dom\": \"^19.0.0\",\n    \"@vitejs/plugin-react\": \"^5.0.0\",\n    \"typescript\": \"~5.8.2\",\n    \"vite\": \"^6.2.0\"\n  }\n}",
            "tsconfig.json": "{\n  \"compilerOptions\": {\n    \"target\": \"ESNext\",\n    \"useDefineForClassFields\": true,\n    \"lib\": [\"DOM\", \"DOM.Iterable\", \"ESNext\"],\n    \"allowJs\": false,\n    \"skipLibCheck\": true,\n    \"esModuleInterop\": false,\n    \"allowSyntheticDefaultImports\": true,\n    \"strict\": true,\n    \"forceConsistentCasingInFileNames\": true,\n    \"module\": \"ESNext\",\n    \"moduleResolution\": \"Node\",\n    \"resolveJsonModule\": true,\n    \"isolatedModules\": true,\n    \"noEmit\": true,\n    \"jsx\": \"react-jsx\"\n  },\n  \"include\": [\"src\"]\n}",
            "vite.config.ts": "import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\n\nexport default defineConfig({\n  plugins: [react()],\n  define: {\n    'process.env': {}\n  }\n});",
            "index.html": "<!DOCTYPE html>\n<html lang=\"zh-CN\">\n  <head>\n    <meta charset=\"UTF-8\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no\" />\n    <title>AI 智能画板</title>\n    <style>\n      body { margin: 0; padding: 0; overflow: hidden; background-color: #f0f2f5; }\n    </style>\n  </head>\n  <body>\n    <div id=\"root\"></div>\n    <script type=\"module\" src=\"/src/index.tsx\"></script>\n  </body>\n</html>",
            "src/index.tsx": "import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App';\nimport './App.css';\n\nconst root = ReactDOM.createRoot(document.getElementById('root')!);\nroot.render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>\n);",
            "src/App.tsx": "import React, { useState, useRef, useEffect } from 'react';\nimport Canvas from './components/Canvas';\nimport Toolbar from './components/Toolbar';\nimport { AIService } from './services/aiService';\n\nconst App: React.FC = () => {\n  const [color, setColor] = useState('#000000');\n  const [lineWidth, setLineWidth] = useState(5);\n  const [tool, setTool] = useState<'pencil' | 'eraser'>('pencil');\n  const [aiAnalysis, setAiAnalysis] = useState<string>('');\n  const [isAnalyzing, setIsAnalyzing] = useState(false);\n  \n  const canvasRef = useRef<HTMLCanvasElement>(null);\n  const aiService = useRef(new AIService('')); // API Key will be read from process.env in service\n\n  const handleClear = () => {\n    if (window.confirm('确定要清空画布吗？')) {\n      const canvas = canvasRef.current;\n      if (canvas) {\n        const ctx = canvas.getContext('2d');\n        ctx?.clearRect(0, 0, canvas.width, canvas.height);\n        setAiAnalysis('');\n      }\n    }\n  };\n\n  const handleDownload = () => {\n    const canvas = canvasRef.current;\n    if (canvas) {\n      const link = document.createElement('a');\n      link.download = `drawing-${Date.now()}.png`;\n      link.href = canvas.toDataURL();\n      link.click();\n    }\n  };\n\n  const handleAIAnalyze = async () => {\n    const canvas = canvasRef.current;\n    if (!canvas) return;\n\n    setIsAnalyzing(true);\n    setAiAnalysis('AI 正在思考中...');\n\n    try {\n      const imageData = canvas.toDataURL('image/jpeg');\n      const prompt = \"请分析这张图片里的简笔画。它画的是什么？请给出简洁有趣的描述。\";\n      // 注意：这里需要传入图像数据作为内容的一部分\n      const result = await aiService.current.generateContent(prompt + \" (图片已通过上下文提供)\");\n      setAiAnalysis(result || 'AI 没看懂这是什么，再多画几笔吧！');\n    } catch (error) {\n      setAiAnalysis('AI 分析失败，请检查网络或 API Key 设置。');\n      console.error(error);\n    } finally {\n      setIsAnalyzing(false);\n    }\n  };\n\n  return (\n    <div className=\"app-container\">\n      <header className=\"app-header\">\n        <h1>AI 智能画板</h1>\n        <div className=\"header-actions\">\n          <button onClick={handleAIAnalyze} disabled={isAnalyzing} className=\"ai-btn\">\n            {isAnalyzing ? '分析中...' : 'AI 识别画作'}\n          </button>\n          <button onClick={handleDownload} className=\"secondary-btn\">下载图片</button>\n          <button onClick={handleClear} className=\"danger-btn\">清空</button>\n        </div>\n      </header>\n\n      <main className=\"main-content\">\n        <Toolbar \n          color={color} \n          setColor={setColor} \n          lineWidth={lineWidth} \n          setLineWidth={setLineWidth}\n          tool={tool}\n          setTool={setTool}\n        />\n        \n        <div className=\"canvas-wrapper\">\n          <Canvas \n            ref={canvasRef} \n            color={tool === 'eraser' ? '#f0f2f5' : color} \n            lineWidth={lineWidth} \n          />\n          {aiAnalysis && (\n            <div className=\"ai-bubble\">\n              <strong>AI 评价:</strong> {aiAnalysis}\n              <button onClick={() => setAiAnalysis('')} className=\"close-bubble\">×</button>\n            </div>\n          )}\n        </div>\n      </main>\n\n      <footer className=\"app-footer\">\n        <p>提示：使用鼠标或触摸屏开始绘画。点击 \"AI 识别\" 让人工智能猜猜你画了什么。</p>\n      </footer>\n    </div>\n  );\n};\n\nexport default App;",
            "src/App.css": ":root {\n  --primary-color: #4a90e2;\n  --danger-color: #ff4d4f;\n  --bg-color: #f0f2f5;\n  --panel-bg: #ffffff;\n  --shadow: 0 4px 12px rgba(0,0,0,0.1);\n}\n\n* {\n  box-sizing: border-box;\n}\n\nbody {\n  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;\n  background-color: var(--bg-color);\n  color: #333;\n}\n\n.app-container {\n  display: flex;\n  flex-direction: column;\n  height: 100vh;\n  width: 100vw;\n}\n\n.app-header {\n  padding: 1rem 2rem;\n  background: var(--panel-bg);\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  box-shadow: 0 2px 8px rgba(0,0,0,0.05);\n  z-index: 10;\n}\n\n.app-header h1 {\n  margin: 0;\n  font-size: 1.5rem;\n  color: var(--primary-color);\n}\n\n.header-actions {\n  display: flex;\n  gap: 10px;\n}\n\n.main-content {\n  flex: 1;\n  display: flex;\n  padding: 1rem;\n  gap: 1rem;\n  overflow: hidden;\n}\n\n.canvas-wrapper {\n  flex: 1;\n  position: relative;\n  background: white;\n  border-radius: 12px;\n  box-shadow: var(--shadow);\n  overflow: hidden;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}\n\n.ai-bubble {\n  position: absolute;\n  bottom: 20px;\n  left: 50%;\n  transform: translateX(-50%);\n  background: rgba(255, 255, 255, 0.95);\n  padding: 15px 25px;\n  border-radius: 30px;\n  box-shadow: 0 4px 20px rgba(0,0,0,0.15);\n  max-width: 80%;\n  border: 2px solid var(--primary-color);\n  animation: slideUp 0.3s ease-out;\n}\n\n@keyframes slideUp {\n  from { transform: translate(-50%, 20px); opacity: 0; }\n  to { transform: translate(-50%, 0); opacity: 1; }\n}\n\n.close-bubble {\n  margin-left: 10px;\n  border: none;\n  background: none;\n  cursor: pointer;\n  font-size: 1.2rem;\n  color: #999;\n}\n\nbutton {\n  padding: 8px 16px;\n  border-radius: 6px;\n  border: none;\n  cursor: pointer;\n  font-weight: 500;\n  transition: all 0.2s;\n}\n\n.ai-btn {\n  background: linear-gradient(135deg, #6e8efb, #a777e3);\n  color: white;\n}\n\n.ai-btn:hover { opacity: 0.9; transform: translateY(-1px); }\n\n.secondary-btn { background: #e8e8e8; color: #333; }\n.danger-btn { background: var(--danger-color); color: white; }\n\n.app-footer {\n  padding: 0.5rem;\n  text-align: center;\n  font-size: 0.8rem;\n  color: #888;\n}\n\n@media (max-width: 768px) {\n  .main-content {\n    flex-direction: column-reverse;\n  }\n  .app-header {\n    padding: 0.8rem;\n  }\n  .header-actions button {\n    padding: 6px 10px;\n    font-size: 0.8rem;\n  }\n}",
            "src/components/Canvas.tsx": "import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';\n\ninterface CanvasProps {\n  color: string;\n  lineWidth: number;\n}\n\nconst Canvas = forwardRef<HTMLCanvasElement, CanvasProps>(({ color, lineWidth }, ref) => {\n  const internalCanvasRef = useRef<HTMLCanvasElement>(null);\n  const isDrawing = useRef(false);\n  const lastPos = useRef({ x: 0, y: 0 });\n\n  useImperativeHandle(ref, () => internalCanvasRef.current!);\n\n  useEffect(() => {\n    const canvas = internalCanvasRef.current;\n    if (!canvas) return;\n\n    const resizeCanvas = () => {\n      const parent = canvas.parentElement;\n      if (parent) {\n        // 保存当前内容\n        const tempImage = canvas.toDataURL();\n        canvas.width = parent.clientWidth;\n        canvas.height = parent.clientHeight;\n        \n        // 恢复内容\n        const ctx = canvas.getContext('2d');\n        const img = new Image();\n        img.onload = () => ctx?.drawImage(img, 0, 0);\n        img.src = tempImage;\n      }\n    };\n\n    resizeCanvas();\n    window.addEventListener('resize', resizeCanvas);\n    return () => window.removeEventListener('resize', resizeCanvas);\n  }, []);\n\n  const getPos = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {\n    const canvas = internalCanvasRef.current;\n    if (!canvas) return { x: 0, y: 0 };\n    \n    const rect = canvas.getBoundingClientRect();\n    let clientX, clientY;\n\n    if ('touches' in e) {\n      clientX = e.touches[0].clientX;\n      clientY = e.touches[0].clientY;\n    } else {\n      clientX = (e as MouseEvent).clientX;\n      clientY = (e as MouseEvent).clientY;\n    }\n\n    return {\n      x: clientX - rect.left,\n      y: clientY - rect.top\n    };\n  };\n\n  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {\n    isDrawing.current = true;\n    lastPos.current = getPos(e);\n  };\n\n  const draw = (e: React.MouseEvent | React.TouchEvent) => {\n    if (!isDrawing.current) return;\n    \n    const canvas = internalCanvasRef.current;\n    const ctx = canvas?.getContext('2d');\n    if (!ctx) return;\n\n    const currentPos = getPos(e);\n\n    ctx.beginPath();\n    ctx.strokeStyle = color;\n    ctx.lineWidth = lineWidth;\n    ctx.lineCap = 'round';\n    ctx.lineJoin = 'round';\n    ctx.moveTo(lastPos.current.x, lastPos.current.y);\n    ctx.lineTo(currentPos.x, currentPos.y);\n    ctx.stroke();\n\n    lastPos.current = currentPos;\n  };\n\n  const stopDrawing = () => {\n    isDrawing.current = false;\n  };\n\n  return (\n    <canvas\n      ref={internalCanvasRef}\n      onMouseDown={startDrawing}\n      onMouseMove={draw}\n      onMouseUp={stopDrawing}\n      onMouseOut={stopDrawing}\n      onTouchStart={startDrawing}\n      onTouchMove={draw}\n      onTouchEnd={stopDrawing}\n      style={{ cursor: 'crosshair', touchAction: 'none' }}\n    />\n  );\n});\n\nexport default Canvas;",
            "src/components/Toolbar.tsx": "import React from 'react';\n\ninterface ToolbarProps {\n  color: string;\n  setColor: (color: string) => void;\n  lineWidth: number;\n  setLineWidth: (width: number) => void;\n  tool: 'pencil' | 'eraser';\n  setTool: (tool: 'pencil' | 'eraser') => void;\n}\n\nconst Toolbar: React.FC<ToolbarProps> = ({ \n  color, setColor, lineWidth, setLineWidth, tool, setTool \n}) => {\n  const colors = ['#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffa500'];\n\n  return (\n    <aside className=\"toolbar\">\n      <div className=\"tool-section\">\n        <h3>工具</h3>\n        <div className=\"tool-buttons\">\n          <button \n            className={tool === 'pencil' ? 'active' : ''} \n            onClick={() => setTool('pencil')}\n          >\n            ✏️ 画笔\n          </button>\n          <button \n            className={tool === 'eraser' ? 'active' : ''} \n            onClick={() => setTool('eraser')}\n          >\n            🧽 橡皮擦\n          </button>\n        </div>\n      </div>\n\n      <div className=\"tool-section\">\n        <h3>颜色</h3>\n        <div className=\"color-grid\">\n          {colors.map(c => (\n            <div \n              key={c}\n              className={`color-swatch ${color === c ? 'selected' : ''}`}\n              style={{ backgroundColor: c }}\n              onClick={() => { setColor(c); setTool('pencil'); }}\n            />\n          ))}\n          <input \n            type=\"color\" \n            value={color} \n            onChange={(e) => setColor(e.target.value)} \n            className=\"color-input\"\n          />\n        </div>\n      </div>\n\n      <div className=\"tool-section\">\n        <h3>粗细: {lineWidth}px</h3>\n        <input \n          type=\"range\" \n          min=\"1\" \n          max=\"50\" \n          value={lineWidth} \n          onChange={(e) => setLineWidth(parseInt(e.target.value))} \n          className=\"width-slider\"\n        />\n      </div>\n\n      <style>{`\n        .toolbar {\n          width: 200px;\n          background: white;\n          padding: 1.5rem;\n          border-radius: 12px;\n          box-shadow: 0 4px 12px rgba(0,0,0,0.1);\n          display: flex;\n          flex-direction: column;\n          gap: 2rem;\n        }\n        .tool-section h3 {\n          margin: 0 0 10px 0;\n          font-size: 0.9rem;\n          color: #666;\n          text-transform: uppercase;\n          letter-spacing: 1px;\n        }\n        .tool-buttons {\n          display: flex;\n          flex-direction: column;\n          gap: 8px;\n        }\n        .tool-buttons button {\n          text-align: left;\n          background: #f8f9fa;\n          border: 1px solid #eee;\n          color: #333;\n        }\n        .tool-buttons button.active {\n          background: #4a90e2;\n          color: white;\n          border-color: #4a90e2;\n        }\n        .color-grid {\n          display: grid;\n          grid-template-columns: repeat(4, 1fr);\n          gap: 8px;\n        }\n        .color-swatch {\n          width: 28px;\n          height: 28px;\n          border-radius: 50%;\n          cursor: pointer;\n          border: 2px solid transparent;\n          transition: transform 0.1s;\n        }\n        .color-swatch:hover { transform: scale(1.1); }\n        .color-swatch.selected { border-color: #333; transform: scale(1.1); }\n        .color-input {\n          grid-column: span 4;\n          width: 100%;\n          height: 30px;\n          padding: 0;\n          border: none;\n          background: none;\n          cursor: pointer;\n        }\n        .width-slider {\n          width: 100%;\n          cursor: pointer;\n        }\n        @media (max-width: 768px) {\n          .toolbar {\n            width: 100%;\n            flex-direction: row;\n            padding: 0.8rem;\n            gap: 1rem;\n            overflow-x: auto;\n          }\n          .tool-section {\n            min-width: 120px;\n          }\n          .color-grid {\n            grid-template-columns: repeat(5, 1fr);\n          }\n        }\n      `}</style>\n    </aside>\n  );\n};\n\nexport default Toolbar;",
            "src/services/aiService.ts": "import { GoogleGenAI } from \"@google/genai\";\n\nexport class AIService {\n  private genAI: GoogleGenAI;\n\n  constructor(apiKey: string) {\n    // 优先使用环境变量，如果没有则使用传入的 key\n    this.genAI = new GoogleGenAI({\n      apiKey: process.env.API_KEY || apiKey || 'YOUR_API_KEY_HERE'\n    });\n  }\n\n  async generateContent(prompt: string): Promise<any> {\n    try {\n      const response: any = await this.genAI.models.generateContent({\n        model: 'gemini-3-flash-preview',\n        contents: [{\n          role: 'user',\n          parts: [{ text: prompt }]\n        }],\n        config: {\n          temperature: 0.8,\n          topP: 0.95,\n        },\n      });\n      \n      // 尝试获取返回的文本内容\n      // 根据 API 结构，通常在 response.candidates[0].content.parts[0].text\n      // 或者使用封装好的 text() 方法（如果库支持）\n      const text = response?.candidates?.[0]?.content?.parts?.[0]?.text ?? \n                   response?.text ?? \n                   'AI 无法识别当前内容';\n                   \n      return text;\n    } catch (error: any) {\n      console.error('AI generation error:', error);\n      return 'AI 连接失败，请检查 API 配置。';\n    }\n  }\n}"
        },
        "thinking": "用户需要一个画板应用。我将构建一个功能齐全的现代化画板，包含以下功能：\n1.  **基础绘画**：支持自由画笔、橡皮擦。\n2.  **样式控制**：颜色选择器、画笔粗细调节。\n3.  **操作历史**：撤销 (Undo) 和 重做 (Redo) 功能。\n4.  **文件操作**：清除画板、下载作品为图片。\n5.  **AI 集成**：利用 Gemini AI 分析当前画作（例如识别画的是什么）。\n6.  **响应式设计**：适配桌面端和移动端触摸操作。\n\n技术实现要点：\n- 使用 HTML5 Canvas API 进行绘图。\n- 使用 React 19 状态管理。\n- 采用 TypeScript 确保代码质量。\n- 集成 `@google/genai` 提供 AI 识别功能。",
        "sourcePath": "/Users/construct/Documents/mine/ai_studio/google_aistudio_preview/.tmp/5a9bca03-0404-4498-8b76-af6de73801d3/source",
        "model": "gemini-3-flash-preview",
        "usage": {
            "promptTokens": 1766,
            "completionTokens": 5607,
            "totalTokens": 7373
        }
    },
    "message": "Code generated successfully"
}
interface Model {
    id: string;
    provider: string;
    label: string;
    maxTokens: number;
}

interface Message {
    role: 'user' | 'assistant';
    content: string;
    thinking?: string; // AI 的思考过程
    timestamp?: number;
}

interface GeneratedData {
    chatId: string;
    sessionId: string;
    fileName: string; // 文件名标识，用于 AI 识别
    files: string[];
    fileContents?: Record<string, string>; // 添加文件内容
    sourcePath?: string; // 源码目录路径
    model: string;
    usage?: {
        promptTokens?: number;
        completionTokens?: number;
        totalTokens: number;
    };
}

export const CodeGen: React.FC = () => {
    const { t } = useI18n();
    const [models, setModels] = useState<Model[]>([]);
    const [selectedModel, setSelectedModel] = useState<string>('');
    const [prompt, setPrompt] = useState<string>('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [currentChatId, setCurrentChatId] = useState<string>('');
    const [generatedData, setGeneratedData] = useState<GeneratedData | null>(null);
    const [streamContent, setStreamContent] = useState<string>('');
    const [streamThinking, setStreamThinking] = useState<string>(''); // 流式思考过程
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const streamContentRef = useRef<string>(''); // 用于跟踪 streamContent 的最新值
    const streamThinkingRef = useRef<string>(''); // 用于跟踪 streamThinking 的最新值

    // Load models on mount
    useEffect(() => {
        loadModels();
    }, []);

    // Auto scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, streamContent]);

    const loadModels = async () => {
        try {
            const response: any = await api.codegenGetModels();
            if (response.success && response.models) {
                setModels(response.models);
                if (response.models.length > 0) {
                    setSelectedModel(response.models[0].id);
                }
            }
        } catch (error) {
            console.error('Failed to load models:', error);
        }
    };

    const handleGenerate = async () => {
        if (!prompt.trim() || !selectedModel || isGenerating) return;

        const userMessage: Message = {
            role: 'user',
            content: prompt,
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, userMessage]);
        setPrompt('');
        setIsGenerating(true);
        setStreamContent('');
        setStreamThinking('');
        streamContentRef.current = ''; // 重置 ref
        streamThinkingRef.current = ''; // 重置 thinking ref
 
        try {
            const res:any = await api.codegenInit({
                modelId: selectedModel,
                prompt,
            })
            // 显示对话内容
            const assistantMessage: Message = {
                role: 'assistant',
                content: res.message,
                thinking: res.data.thinking,
                timestamp: Date.now()
            };

            setMessages(prev => [...prev, assistantMessage]);
            setGeneratedData(res.data);
            setCurrentChatId(res.data.chatId);
            setIsGenerating(false);

            // 1秒后弹出确认对话框
            setTimeout(() => {
                const deploymentUrl = `http://localhost/deployments/${res.data.sessionId}/`;
                if (window.confirm(`代码生成成功！\n\n是否要打开部署页面？\n${deploymentUrl}`)) {
                    window.open(deploymentUrl, '_blank');
                }
            }, 1000);

        } catch (error) {
            console.error('Generation error:', error);
            setIsGenerating(false);
            setStreamContent('');
        }
    };


    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleGenerate();
        }
    };

    const handleNewChat = () => {
        setCurrentChatId('');
        setMessages([]);
        setGeneratedData(null);
        setStreamContent('');
        setStreamThinking('');
        streamContentRef.current = '';
        streamThinkingRef.current = '';
    };

    return (
        <div className="codegen-page">
            <div className="codegen-header">
                <div className="header-content">
                    <h1>{t.codegen.title}</h1>
                    <p>{t.codegen.subtitle}</p>
                </div>
                <div className="header-actions">
                    {currentChatId && (
                        <button className="new-chat-btn" onClick={handleNewChat}>
                            + {t.common.new}
                        </button>
                    )}
                </div>
            </div>

            <div className="codegen-container">
                {/* Main Chat Area */}
                <div className="chat-section">
                    <div className="messages-area">
                        {messages.length === 0 && !streamContent && (
                            <div className="empty-state">
                                <div className="empty-icon">{'</>'}</div>
                                <p>{t.codegen.chat.emptyState}</p>
                            </div>
                        )}

                        {messages.map((msg, idx) => (
                            <div key={idx} className={`message ${msg.role}`}>
                                <div className="message-avatar">
                                    {msg.role === 'user' ? '👤' : '🤖'}
                                </div>
                                <div className="message-content">
                                    <div className="message-header">
                                        {msg.role === 'user' ? t.codegen.chat.user : t.codegen.chat.assistant}
                                    </div>
                                    {msg.thinking && (
                                        <div className="message-thinking">
                                            <div className="thinking-header">💭 思考过程</div>
                                            <div className="thinking-content">{msg.thinking}</div>
                                        </div>
                                    )}
                                    <div className="message-text">{msg.content}</div>
                                </div>
                            </div>
                        ))}

                        {(streamContent || streamThinking) && (
                            <div className="message assistant streaming">
                                <div className="message-avatar">🤖</div>
                                <div className="message-content">
                                    <div className="message-header">{t.codegen.chat.assistant}</div>
                                    {streamThinking && (
                                        <div className="message-thinking">
                                            <div className="thinking-header">💭 思考过程</div>
                                            <div className="thinking-content">{streamThinking}</div>
                                        </div>
                                    )}
                                    {streamContent && (
                                        <div className="message-text">{streamContent}</div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="input-section">
                        <div className="model-selector">
                            <label>{t.codegen.model.label}</label>
                            <select
                                value={selectedModel}
                                onChange={(e) => setSelectedModel(e.target.value)}
                                disabled={isGenerating}
                            >
                                {models.map(model => (
                                    <option key={model.id} value={model.id}>
                                        {model.label} ({model.provider})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="input-area">
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder={t.codegen.input.placeholder}
                                disabled={isGenerating}
                                rows={3}
                            />
                            <button
                                onClick={handleGenerate}
                                disabled={!prompt.trim() || !selectedModel || isGenerating}
                                className="send-btn"
                            >
                                {isGenerating ? t.codegen.input.generating : t.codegen.input.send}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
