import React, { useState, useEffect, useRef } from 'react';
import { useI18n } from '../../context/I18nContext';
import { api } from '../../services/api';
import { SandpackPreview } from './components/SandpackPreview';
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
            if (currentChatId) {
                // Continue existing conversation
                await api.codegenChatStream(
                    {
                        chatId: currentChatId,
                        prompt: userMessage.content,
                        modelId: selectedModel
                    },
                    (content) => {
                        streamContentRef.current += content;
                        setStreamContent(prev => prev + content);
                    },
                    (data) => {
                        const assistantMessage: Message = {
                            role: 'assistant',
                            content: streamContentRef.current, // 使用 ref 中的最新值
                            thinking: streamThinkingRef.current, // 添加思考过程
                            timestamp: Date.now()
                        };
                        setMessages(prev => [...prev, assistantMessage]);
                        setStreamContent('');
                        setStreamThinking('');
                        streamContentRef.current = '';
                        streamThinkingRef.current = '';
                        setGeneratedData(data);
                        setIsGenerating(false);
                    },
                    (error) => {
                        console.error('Stream error:', error);
                        setIsGenerating(false);
                        setStreamContent('');
                        setStreamThinking('');
                        streamContentRef.current = '';
                        streamThinkingRef.current = '';
                    },
                    (thinking) => {
                        streamThinkingRef.current += thinking;
                        setStreamThinking(prev => prev + thinking);
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
                        streamContentRef.current += content;
                        setStreamContent(prev => prev + content);
                    },
                    (data) => {
                        const assistantMessage: Message = {
                            role: 'assistant',
                            content: streamContentRef.current, // 使用 ref 中的最新值
                            thinking: streamThinkingRef.current, // 添加思考过程
                            timestamp: Date.now()
                        };
                        setMessages(prev => [...prev, assistantMessage]);
                        setStreamContent('');
                        setStreamThinking('');
                        streamContentRef.current = '';
                        streamThinkingRef.current = '';
                        setGeneratedData(data);
                        setCurrentChatId(data.chatId);
                        setIsGenerating(false);
                    },
                    (error) => {
                        console.error('Stream error:', error);
                        setIsGenerating(false);
                        setStreamContent('');
                        setStreamThinking('');
                        streamContentRef.current = '';
                        streamThinkingRef.current = '';
                    },
                    (thinking) => {
                        streamThinkingRef.current += thinking;
                        setStreamThinking(prev => prev + thinking);
                    }
                );
            }
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
