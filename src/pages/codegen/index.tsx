import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import './CodeGen.scss';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    thinking?: string;
    isStreaming?: boolean;
}

export const CodeGen: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [currentChatId, setCurrentChatId] = useState<string | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [selectedModel, setSelectedModel] = useState('');
    const [models, setModels] = useState<any[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

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
                    // onContent
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
                        setMessages(prev => prev.map(msg =>
                            msg.id === aiMessageId
                                ? { ...msg, isStreaming: false }
                                : msg
                        ));
                        setIsLoading(false);
                        setPreviewLoading(false);
                        if (data.sessionId) {
                            setCurrentSessionId(data.sessionId);
                        }
                    },
                    // onError
                    (error) => {
                        console.error('Chat error:', error);
                        setMessages(prev => prev.map(msg =>
                            msg.id === aiMessageId
                                ? { ...msg, content: `Error: ${error}`, isStreaming: false }
                                : msg
                        ));
                        setIsLoading(false);
                        setPreviewLoading(false);
                    },
                    // onThinking
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
                    },
                    // onContent
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
                        setMessages(prev => prev.map(msg =>
                            msg.id === aiMessageId
                                ? { ...msg, isStreaming: false }
                                : msg
                        ));
                        setIsLoading(false);
                        setPreviewLoading(false);
                        if (data.sessionId) {
                            setCurrentSessionId(data.sessionId);
                        }
                    },
                    // onError
                    (error) => {
                        console.error('Init error:', error);
                        setMessages(prev => prev.map(msg =>
                            msg.id === aiMessageId
                                ? { ...msg, content: `Error: ${error}`, isStreaming: false }
                                : msg
                        ));
                        setIsLoading(false);
                        setPreviewLoading(false);
                    },
                    // onThinking
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
    };

    return (
        <div className="codegen-page">
            {/* Header */}
            <div className="codegen-header">
                <div className="header-content">
                    <h1>Code Generator</h1>
                    <p>Generate code with AI assistance</p>
                </div>
                <div className="header-actions">
                    <button className="new-chat-btn" onClick={handleNewChat}>
                        New Chat
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
                                <div className="empty-icon">💬</div>
                                <p>Start a conversation to generate code</p>
                            </div>
                        ) : (
                            messages.map((message) => (
                                <div key={message.id} className={`message ${message.role} ${message.isStreaming ? 'streaming' : ''}`}>
                                    <div className="message-avatar">
                                        {message.role === 'user' ? '👤' : '🤖'}
                                    </div>
                                    <div className="message-content">
                                        <div className="message-header">
                                            {message.role === 'user' ? 'You' : 'AI Assistant'}
                                        </div>
                                        {message.thinking && (
                                            <div className="message-thinking">
                                                <div className="thinking-header">
                                                    💭 Thinking...
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
                            <label>Model:</label>
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
                                placeholder="Describe what you want to create..."
                                rows={3}
                                disabled={isLoading}
                            />
                            <button
                                className="send-btn"
                                onClick={handleSend}
                                disabled={isLoading || !inputValue.trim() || !selectedModel}
                            >
                                {isLoading ? 'Generating...' : 'Send'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right: Preview Section */}
                <div className="preview-section">
                    {!currentSessionId && !previewLoading ? (
                        <div className="preview-empty">
                            <div className="preview-empty-icon">🖼️</div>
                            <p>Preview will appear here</p>
                        </div>
                    ) : previewLoading && !currentSessionId ? (
                        <div className="preview-loading">
                            <div className="spinner"></div>
                            <p>Building your project...</p>
                        </div>
                    ) : currentSessionId ? (
                        <iframe
                            src={`http://localhost:80/deployments/${currentSessionId}/`}
                            className="preview-iframe"
                            title="Preview"
                        />
                    ) : null}
                </div>
            </div>
        </div>
    );
}