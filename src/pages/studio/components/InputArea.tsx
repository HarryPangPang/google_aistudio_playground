import React from 'react';
import { useI18n } from '../../../context/I18nContext';
import './css/InputArea.scss';

interface InputAreaProps {
    prompt: string;
    setPrompt: (value: string) => void;
    isGenerating: boolean;
    onGenerate: () => void;
}

export const InputArea: React.FC<InputAreaProps> = ({ prompt, setPrompt, isGenerating, onGenerate }) => {
    const { $l } = useI18n();

    return (
        <div className="ai-studio-input-area">
            <div style={{
                width: '100%',
                maxWidth: '800px',
                position: 'relative',
                backgroundColor: '#f9f9f9',
                borderRadius: '16px',
                border: '1px solid #e0e0e0',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                transition: 'border-color 0.2s, box-shadow 0.2s'
            }}>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={$l('studio.input.placeholder')}
                    style={{
                        width: '100%',
                        height: '60px',
                        padding: '16px 60px 16px 20px', // Right padding for button
                        border: 'none',
                        resize: 'none',
                        outline: 'none',
                        fontSize: '15px',
                        lineHeight: '1.5',
                        fontFamily: 'inherit',
                        backgroundColor: 'transparent',
                        boxSizing: 'border-box'
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            onGenerate();
                        }
                    }}
                />
                <button
                    onClick={onGenerate}
                    disabled={isGenerating || !prompt.trim()}
                    style={{
                        position: 'absolute',
                        right: '12px',
                        bottom: '12px',
                        width: '36px',
                        height: '36px',
                        backgroundColor: isGenerating || !prompt.trim() ? '#e0e0e0' : '#000',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        cursor: isGenerating || !prompt.trim() ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background-color 0.2s'
                    }}
                >
                    {isGenerating ? (
                        <span style={{ fontSize: '12px' }}>...</span>
                    ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="19" x2="12" y2="5"></line>
                            <polyline points="5 12 12 5 19 12"></polyline>
                        </svg>
                    )}
                </button>
            </div>
        </div>
    );
};
