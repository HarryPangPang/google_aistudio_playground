import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import { useI18n } from '../../context/I18nContext';
import './CodeGen.scss';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    thinking?: string;
    isStreaming?: boolean;
    codeProgress?: number; // 代码生成进度
}

const BUILD_POLL_INTERVAL_MS = 2500;
const BUILD_POLL_MAX_ATTEMPTS = 120; // ~5 min

export const CodeGen: React.FC = () => {
    const { t } = useI18n();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [currentChatId, setCurrentChatId] = useState<string | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewReady, setPreviewReady] = useState(false); // 标记预览是否准备好
    const [buildError, setBuildError] = useState<string | null>(null); // 构建失败时展示
    const [selectedModel, setSelectedModel] = useState('');
    const [models, setModels] = useState<any[]>([]);
    const [copySuccess, setCopySuccess] = useState(false); // 复制成功提示
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const buildPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // 加载支持的模型列表
    useEffect(() => {
        api.codegenGetModels()
            .then((res: any) => {
                if (res.success && res.models) {
                    setModels(res.models);
                    // 设置第一个模型为默认模型
                    if (res.models.length > 0 && !selectedModel) {
                        setSelectedModel(res.models[0].id);
                    }
                }
            })
            .catch(err => console.error('Failed to load models:', err));
    }, []);

    // 自动滚动到底部
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // 构建状态轮询：生成完成后轮询 buildRecord，构建失败时展示 error_message
    const startBuildPoll = (chatId: string) => {
        if (buildPollRef.current) {
            clearInterval(buildPollRef.current);
            buildPollRef.current = null;
        }
        setBuildError(null);
        let attempts = 0;
        buildPollRef.current = setInterval(async () => {
            attempts++;
            if (attempts > BUILD_POLL_MAX_ATTEMPTS) {
                if (buildPollRef.current) clearInterval(buildPollRef.current);
                buildPollRef.current = null;
                return;
            }
            try {
                const res: any = await api.getBuildRecord();
                if (!res?.success || !Array.isArray(res.data)) return;
                const record = res.data.find((r: any) => r.drive_id === chatId);
                if (!record) return;
                if (record.is_processed === 1) {
                    setBuildError(null);
                    if (buildPollRef.current) clearInterval(buildPollRef.current);
                    buildPollRef.current = null;
                } else if (record.is_processed === 3 && record.error_message) {
                    setBuildError(record.error_message);
                    if (buildPollRef.current) clearInterval(buildPollRef.current);
                    buildPollRef.current = null;
                }
            } catch (e) {
                console.warn('Build poll error:', e);
            }
        }, BUILD_POLL_INTERVAL_MS);
    };

    useEffect(() => {
        return () => {
            if (buildPollRef.current) {
                clearInterval(buildPollRef.current);
                buildPollRef.current = null;
            }
        };
    }, []);

    // 发送消息
    const handleSend = async () => {
        if (!inputValue.trim() || isLoading || !selectedModel) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: inputValue.trim()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);
        setPreviewLoading(true);
        setPreviewReady(false);
        setBuildError(null);

        // 创建一个新的 AI 消息用于流式更新
        const aiMessageId = (Date.now() + 1).toString();
        const aiMessage: Message = {
            id: aiMessageId,
            role: 'assistant',
            content: '',
            thinking: '',
            isStreaming: true
        };
        setMessages(prev => [...prev, aiMessage]);

        try {
            if (currentChatId) {
                // 继续对话
                api.codegenChatStream(
                    {
                        chatId: currentChatId,
                        prompt: userMessage.content,
                        modelId: selectedModel
                    },
                    // onContent (兼容旧格式,新格式不使用)
                    (content) => {
                        setMessages(prev => prev.map(msg =>
                            msg.id === aiMessageId
                                ? { ...msg, content: msg.content + content }
                                : msg
                        ));
                    },
                    // onComplete
                    (data) => {
                        console.log('Chat complete:', data);
                        const fileCount = data.files?.length || 0;
                        let content = t.codegen.message.codeUpdating.replace('{count}', fileCount.toString());
                        if (data.success === false && data.warning) content += '\n' + data.warning;
                        setMessages(prev => prev.map(msg =>
                            msg.id === aiMessageId
                                ? { ...msg, content, isStreaming: false }
                                : msg
                        ));
                        setIsLoading(false);
                        setPreviewLoading(false);
                        setPreviewReady(true);
                        if (data.sessionId) setCurrentSessionId(data.sessionId);
                        if (data.chatId) startBuildPoll(data.chatId);
                    },
                    // onError
                    (error) => {
                        console.error('Chat error:', error);
                        setMessages(prev => prev.map(msg =>
                            msg.id === aiMessageId
                                ? { ...msg, content: `${t.codegen.message.error}${error}`, isStreaming: false }
                                : msg
                        ));
                        setIsLoading(false);
                        setPreviewLoading(false);
                    },
                    // onThinking (新格式: 接收 think 类型的内容)
                    (thinking) => {
                        setMessages(prev => prev.map(msg =>
                            msg.id === aiMessageId
                                ? { ...msg, thinking: (msg.thinking || '') + thinking }
                                : msg
                        ));
                    }
                );
            } else {
                // 初始化对话
                api.codegenInitStream(
                    {
                        prompt: userMessage.content,
                        modelId: selectedModel
                    },
                    // onInit
                    (data) => {
                        console.log('Init data:', data);
                        setCurrentChatId(data.chatId);
                        setCurrentSessionId(data.sessionId);
                        // 不在这里设置 previewReady，等 onComplete 时再设置
                    },
                    // onContent (兼容旧格式,新格式不使用)
                    (content) => {
                        setMessages(prev => prev.map(msg =>
                            msg.id === aiMessageId
                                ? { ...msg, content: msg.content + content }
                                : msg
                        ));
                    },
                    // onComplete
                    (data) => {
                        console.log('Init complete:', data);
                        const fileCount = data.files?.length || 0;
                        let content = t.codegen.message.codeGenerating.replace('{count}', fileCount.toString());
                        if (data.success === false && data.warning) content += '\n' + data.warning;
                        setMessages(prev => prev.map(msg =>
                            msg.id === aiMessageId
                                ? { ...msg, content, isStreaming: false }
                                : msg
                        ));
                        setIsLoading(false);
                        setPreviewLoading(false);
                        setPreviewReady(true);
                        if (data.sessionId) setCurrentSessionId(data.sessionId);
                        if (data.chatId) startBuildPoll(data.chatId);
                    },
                    // onError
                    (error) => {
                        console.error('Init error:', error);
                        setMessages(prev => prev.map(msg =>
                            msg.id === aiMessageId
                                ? { ...msg, content: `${t.codegen.message.error}${error}`, isStreaming: false }
                                : msg
                        ));
                        setIsLoading(false);
                        setPreviewLoading(false);
                    },
                    // onThinking (新格式: 接收 think 类型的内容)
                    (thinking) => {
                        setMessages(prev => prev.map(msg =>
                            msg.id === aiMessageId
                                ? { ...msg, thinking: (msg.thinking || '') + thinking }
                                : msg
                        ));
                    }
                );
            }
        } catch (error) {
            console.error('Send error:', error);
            setIsLoading(false);
            setPreviewLoading(false);
        }
    };

    // 处理 Enter 键发送
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // 开始新对话
    const handleNewChat = () => {
        setMessages([]);
        setCurrentChatId(null);
        setCurrentSessionId(null);
        setInputValue('');
        setPreviewLoading(false);
        setPreviewReady(false);
        setCopySuccess(false);
    };

    // 复制链接
    const handleCopyLink = () => {
        if (!currentSessionId) return;
        const link = `${window.location.origin}/deployments/${currentSessionId}/`;
        navigator.clipboard.writeText(link).then(() => {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        });
    };

    // 打开链接
    const handleOpenLink = () => {
        if (!currentSessionId) return;
        const link = `${window.location.origin}/deployments/${currentSessionId}/`;
        window.open(link, '_blank');
    };

    return (
        <div className="codegen-page">
            {/* Header */}
            <div className="codegen-header">
                <div className="header-content">
                    <h1>{t.codegen.header.title}</h1>
                    <p>{t.codegen.header.subtitle}</p>
                </div>
                <div className="header-actions">
                    <button className="new-chat-btn" onClick={handleNewChat}>
                        {t.codegen.newChat}
                    </button>
                </div>
            </div>

            {/* Main Container */}
            <div className="codegen-container">
                {/* Left: Chat Section */}
                <div className="chat-section">
                    {/* Messages Area */}
                    <div className="messages-area">
                        {messages.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">{t.codegen.chat.emptyIcon}</div>
                                <p>{t.codegen.chat.emptyState}</p>
                            </div>
                        ) : (
                            messages.map((message) => (
                                <div key={message.id} className={`message ${message.role} ${message.isStreaming ? 'streaming' : ''}`}>
                                    <div className="message-avatar">
                                        {message.role === 'user' ? '👤' : '🤖'}
                                    </div>
                                    <div className="message-content">
                                        <div className="message-header">
                                            {message.role === 'user' ? t.codegen.chat.user : t.codegen.chat.assistant}
                                        </div>
                                        {message.thinking && (
                                            <div className="message-thinking">
                                                <div className="thinking-header">
                                                    {t.codegen.chat.thinking}
                                                </div>
                                                <div className="thinking-content">
                                                    {message.thinking}
                                                </div>
                                            </div>
                                        )}
                                        <div className="message-text">
                                            {message.content}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Section */}
                    <div className="input-section">
                        <div className="model-selector">
                            <label>{t.codegen.model.label}</label>
                            <select
                                value={selectedModel}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedModel(e.target.value)}
                                disabled={isLoading}
                            >
                                {models.map((model) => (
                                    <option key={model.id} value={model.id}>
                                        {model.label || model.id}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="input-area">
                            <textarea
                                ref={textareaRef}
                                value={inputValue}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={t.codegen.input.placeholder}
                                rows={3}
                                disabled={isLoading}
                            />
                            <button
                                className="send-btn"
                                onClick={handleSend}
                                disabled={isLoading || !inputValue.trim() || !selectedModel}
                            >
                                {isLoading ? t.codegen.input.generating : t.codegen.input.send}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right: Preview Section */}
                <div className="preview-section">
                    {!previewLoading && !previewReady ? (
                        <div className="preview-empty">
                            <div className="preview-empty-icon">{t.codegen.preview.emptyIcon}</div>
                            <p>{t.codegen.preview.empty}</p>
                        </div>
                    ) : previewReady && currentSessionId ? (
                        <>
                            {buildError && (
                                <div className="preview-build-error" role="alert">
                                    <strong>{t.codegen?.message?.buildError ?? 'Build failed'}:</strong> {buildError}
                                </div>
                            )}
                            <div className="preview-toolbar">
                                <button className="toolbar-btn" onClick={handleOpenLink}>
                                    🔗 {t.codegen.preview.open}
                                </button>
                                <button className="toolbar-btn" onClick={handleCopyLink}>
                                    {copySuccess ? '✓ ' + t.codegen.preview.linkCopied : '📋 ' + t.codegen.preview.copyLink}
                                </button>
                            </div>
                            <iframe
                                key={currentSessionId}
                                src={`${window.location.origin}/deployments/${currentSessionId}/`}
                                className="preview-iframe"
                                title={t.codegen.preview.title}
                            />
                        </>
                    ) : (
                        <div className="preview-loading">
                            <div className="spinner"></div>
                            <p>{t.codegen.preview.loading}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}