import React, { useState, useEffect, useRef } from 'react';
import { useI18n } from '../../context/I18nContext';
import { api } from '../../services/api';
import './CodeGen.scss';

interface Model {
    id: string;
    provider: string;
    label: string;
    maxTokens: number;
}

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp?: number;
}

interface GeneratedData {
    chatId: string;
    sessionId: string;
    files: string[];
    zipFile?: string;
    zipPath?: string;
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
    const messagesEndRef = useRef<HTMLDivElement>(null);

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

        try {
            if (currentChatId) {
                // Continue existing conversation
                await api.codegenChatStream(
                    {
                        chatId: currentChatId,
                        prompt: userMessage.content,
                        modelId: selectedModel
                    },
                    (content) => {
                        setStreamContent(prev => prev + content);
                    },
                    (data) => {
                        const assistantMessage: Message = {
                            role: 'assistant',
                            content: streamContent,
                            timestamp: Date.now()
                        };
                        setMessages(prev => [...prev, assistantMessage]);
                        setStreamContent('');
                        setGeneratedData(data);
                        setIsGenerating(false);
                    },
                    (error) => {
                        console.error('Stream error:', error);
                        setIsGenerating(false);
                        setStreamContent('');
                    }
                );
            } else {
                // Start new conversation
                await api.codegenInitStream(
                    {
                        prompt: userMessage.content,
                        modelId: selectedModel
                    },
                    (data) => {
                        setCurrentChatId(data.chatId);
                    },
                    (content) => {
                        setStreamContent(prev => prev + content);
                    },
                    (data) => {
                        const assistantMessage: Message = {
                            role: 'assistant',
                            content: streamContent,
                            timestamp: Date.now()
                        };
                        setMessages(prev => [...prev, assistantMessage]);
                        setStreamContent('');
                        setGeneratedData(data);
                        setCurrentChatId(data.chatId);
                        setIsGenerating(false);
                    },
                    (error) => {
                        console.error('Stream error:', error);
                        setIsGenerating(false);
                        setStreamContent('');
                    }
                );
            }
        } catch (error) {
            console.error('Generation error:', error);
            setIsGenerating(false);
            setStreamContent('');
        }
    };

    const handleDownloadZip = () => {
        if (generatedData?.zipFile) {
            const API_HOST = _GLOBAL_VARS_.VITE_API_HOST || _GLOBAL_VARS_.VITE_APP_PROXY;
            const downloadUrl = `${API_HOST}/codedist/${generatedData.zipFile}`;
            window.open(downloadUrl, '_blank');
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
                                    <div className="message-text">{msg.content}</div>
                                </div>
                            </div>
                        ))}

                        {streamContent && (
                            <div className="message assistant streaming">
                                <div className="message-avatar">🤖</div>
                                <div className="message-content">
                                    <div className="message-header">{t.codegen.chat.assistant}</div>
                                    <div className="message-text">{streamContent}</div>
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

                {/* Sidebar - Generated Files & Stats */}
                <div className="sidebar-section">
                    {generatedData && (
                        <>
                            <div className="files-panel">
                                <h3>{t.codegen.files.title}</h3>
                                {generatedData.files && generatedData.files.length > 0 ? (
                                    <>
                                        <ul className="files-list">
                                            {generatedData.files.map((file, idx) => (
                                                <li key={idx}>
                                                    <span className="file-icon">📄</span>
                                                    <span className="file-name">{file}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        {generatedData.zipFile && (
                                            <button
                                                className="download-btn"
                                                onClick={handleDownloadZip}
                                            >
                                                ⬇️ {t.codegen.files.download}
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    <p className="no-files">{t.codegen.files.noFiles}</p>
                                )}
                            </div>

                            {generatedData.usage && (
                                <div className="stats-panel">
                                    <h3>{t.codegen.stats.tokens}</h3>
                                    <div className="stat-item">
                                        <span className="stat-label">Total:</span>
                                        <span className="stat-value">{generatedData.usage.totalTokens}</span>
                                    </div>
                                    {generatedData.usage.promptTokens && (
                                        <div className="stat-item">
                                            <span className="stat-label">Prompt:</span>
                                            <span className="stat-value">{generatedData.usage.promptTokens}</span>
                                        </div>
                                    )}
                                    {generatedData.usage.completionTokens && (
                                        <div className="stat-item">
                                            <span className="stat-label">Completion:</span>
                                            <span className="stat-value">{generatedData.usage.completionTokens}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
