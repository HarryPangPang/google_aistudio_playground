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

    return (
        <div className="import-modal-overlay" onClick={onClose}>
            <div className="import-modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{$l('studio.import.title')}</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                
                <div className="modal-body">
                    <p className="description">{$l('studio.import.description')}</p>
                    
                    <div className="input-group">
                        <input
                            type="text"
                            value={url}
                            onChange={e => {
                                setUrl(e.target.value);
                                setError('');
                            }}
                            placeholder="https://aistudio.google.com/..."
                            className={error ? 'error' : ''}
                        />
                        {error && <span className="error-msg">{error}</span>}
                    </div>

                    <div className="supported-types">
                        <span>{$l('studio.import.supported')}:</span>
                        <span className="type-tag">Google AI Studio URL</span>
                        <span className="type-tag">ZIP</span>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="cancel-btn" onClick={onClose}>
                        {$l('common.cancel')}
                    </button>
                    <button className="confirm-btn" onClick={handleSubmit}>
                        {$l('common.import')}
                    </button>
                </div>
            </div>
        </div>
    );
};
