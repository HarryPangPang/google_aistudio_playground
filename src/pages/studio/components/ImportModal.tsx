import React, { useState } from 'react';
import { useI18n } from '../../../context/I18nContext';
import './css/ImportModal.scss';

interface ImportModalProps {
    visible: boolean;
    onClose: () => void;
    onImport: (url: string) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({ visible, onClose, onImport }) => {
    const { $l } = useI18n();
    const [url, setUrl] = useState('');
    const [error, setError] = useState('');

    if (!visible) return null;

    const handleSubmit = () => {
        if (!url.trim()) {
            setError($l('studio.import.error.empty'));
            return;
        }

        // Basic validation for URL
        try {
            new URL(url);
        } catch {
            setError($l('studio.import.error.invalid'));
            return;
        }

        onImport(url);
        setUrl('');
        setError('');
        onClose();
    };

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            setUrl(text);
            setError('');
        } catch (err) {
            console.error('Failed to read clipboard:', err);
        }
    };

    const handleExampleClick = (exampleUrl: string) => {
        setUrl(exampleUrl);
        setError('');
    };

    return (
        <div className="import-modal-overlay" onClick={onClose}>
            <div className="import-modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="header-title">
                        <span className="header-icon">🔗</span>
                        <h3>{$l('studio.import.title')}</h3>
                        <span className="new-feature-badge">{$l('common.new')}</span>
                    </div>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    <p className="description">{$l('studio.import.description')}</p>

                    <div className="features-grid">
                        <div className="feature-item">
                            <span className="feature-icon">⚡</span>
                            <span className="feature-text">{$l('studio.import.feature.instant')}</span>
                        </div>
                        <div className="feature-item">
                            <span className="feature-icon">🎨</span>
                            <span className="feature-text">{$l('studio.import.feature.fullcode')}</span>
                        </div>
                        <div className="feature-item">
                            <span className="feature-icon">🌐</span>
                            <span className="feature-text">{$l('studio.import.feature.anywhere')}</span>
                        </div>
                    </div>

                    <div className="input-group">
                        <div className="input-wrapper">
                            <input
                                type="text"
                                value={url}
                                onChange={e => {
                                    setUrl(e.target.value);
                                    setError('');
                                }}
                                placeholder="https://ai.studio/apps/drive/12....."
                                className={error ? 'error' : ''}
                                onKeyPress={e => e.key === 'Enter' && handleSubmit()}
                            />
                            <button className="paste-btn" onClick={handlePaste} title={$l('studio.import.paste')}>
                                📋
                            </button>
                        </div>
                        {error && <span className="error-msg">{error}</span>}
                    </div>

                    <div className="examples-section">
                        <span className="examples-label">{$l('studio.import.examples')}:</span>
                        <div className="example-links">
                            <button
                                className="example-link"
                                onClick={() => handleExampleClick('https://ai.studio/apps/drive/examplexxxx')}
                            >
                                Google AI Studio
                            </button>
                            <button
                                className="example-link"
                                onClick={() => handleExampleClick('https://example.com/project.zip')}
                            >
                                ZIP File
                            </button>
                        </div>
                    </div>

                    <div className="supported-types">
                        <span>{$l('studio.import.supported')}:</span>
                        <span className="type-tag">
                            <span className="tag-icon">🔗</span>
                            Google AI Studio
                        </span>
                        <span className="type-tag">
                            <span className="tag-icon">📦</span>
                            ZIP Files
                        </span>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="cancel-btn" onClick={onClose}>
                        {$l('common.cancel')}
                    </button>
                    <button className="confirm-btn" onClick={handleSubmit}>
                        <span className="btn-icon">✨</span>
                        {$l('common.import')}
                    </button>
                </div>
            </div>
        </div>
    );
};
