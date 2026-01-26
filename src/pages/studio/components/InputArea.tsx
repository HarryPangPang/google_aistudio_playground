import React from 'react';
import { useI18n } from '../../../context/I18nContext';
import './css/InputArea.scss';

interface InputAreaProps {
    prompt: string;
    setPrompt: (value: string) => void;
    model: { label: string, value: number };
    setModel: (value: { label: string, value: number }) => void;
    modelOptions: { label: string, value: number }[];
    isGenerating: boolean;
    onGenerate: () => void;
    isProjectCreated: boolean;
}

export const InputArea: React.FC<InputAreaProps> = ({
    prompt,
    setPrompt,
    model,
    setModel,
    modelOptions,
    isGenerating,
    onGenerate,
    isProjectCreated
}) => {
    const { $l } = useI18n();
    const isDisabled = isGenerating || !prompt.trim();

    return (
        <div className="ai-studio-input-area">
            <div className="input-card">
                <div className="input-toolbar">
                    <div className={`model-selector ${isProjectCreated ? 'locked' : ''}`}>
                        <div className="model-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="3"></circle>
                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                            </svg>
                        </div>
                        {isProjectCreated ? (
                            <span className="model-name">{model.label}</span>
                        ) : (
                            <select
                                id="model-select"
                                className="model-select"
                                value={model.value}
                                onChange={(e) => {
                                    const selectedValue = Number(e.target.value);
                                    const selectedModel = modelOptions.find(opt => opt.value === selectedValue);
                                    if (selectedModel) {
                                        setModel(selectedModel);
                                    }
                                }}
                            >
                                {modelOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        )}
                        {!isProjectCreated && (
                            <div className="select-arrow">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                            </div>
                        )}
                    </div>
                </div>
                <div className="input-body">
                    <textarea
                        className="prompt-input"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder={$l('studio.input.placeholder')}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                onGenerate();
                            }
                        }}
                    />
                    <button
                        className="send-btn"
                        onClick={onGenerate}
                        disabled={isDisabled}
                        aria-label={$l('studio.input.send')}
                    >
                        {isGenerating ? (
                            <span className="loading-dots">...</span>
                        ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="19" x2="12" y2="5"></line>
                                <polyline points="5 12 12 5 19 12"></polyline>
                            </svg>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
