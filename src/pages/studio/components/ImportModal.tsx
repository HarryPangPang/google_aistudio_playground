import React, { useState, useRef } from 'react';
import { useI18n } from '../../../context/I18nContext';
import './css/ImportModal.scss';

interface ImportModalProps {
    visible: boolean;
    onClose: () => void;
    onImport: (url: string, file?: File) => Promise<void>;
}

type ImportType = 'aistudio' | 'zipurl' | 'zipfile';

export const ImportModal: React.FC<ImportModalProps> = ({ visible, onClose, onImport }) => {
    const { $l } = useI18n();
    const [importType, setImportType] = useState<ImportType>('aistudio');
    const [url, setUrl] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState('');
    const [isImporting, setIsImporting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!visible) return null;

    const handleSubmit = async () => {
        if (importType === 'zipfile') {
            if (!selectedFile) {
                setError('请选择一个 ZIP 文件');
                return;
            }
        } else {
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
        }

        setIsImporting(true);
        setError('');

        try {
            await onImport(importType === 'zipfile' ? '' : url, importType === 'zipfile' ? selectedFile! : undefined);

            // 显示成功消息
            setSuccessMessage('导入成功！构建任务已启动，请稍候...');

            // 2秒后关闭弹窗
            setTimeout(() => {
                setUrl('');
                setSelectedFile(null);
                setError('');
                setSuccessMessage('');
                setIsImporting(false);
                onClose();
            }, 2000);
        } catch (err: any) {
            setError(err.message || '导入失败，请重试');
            setIsImporting(false);
        }
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

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.name.toLowerCase().endsWith('.zip')) {
                setError('请选择一个 ZIP 文件');
                setSelectedFile(null);
                return;
            }
            setSelectedFile(file);
            setError('');
        }
    };

    const handleFileClick = () => {
        fileInputRef.current?.click();
    };

    const handleTypeChange = (type: ImportType) => {
        setImportType(type);
        setUrl('');
        setSelectedFile(null);
        setError('');
    };

    const handleClose = () => {
        if (!isImporting) {
            setUrl('');
            setSelectedFile(null);
            setError('');
            setSuccessMessage('');
            setIsImporting(false);
            onClose();
        }
    };

    return (
        <div className="import-modal-overlay" onClick={handleClose}>
            <div className="import-modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="header-title">
                        <h3>{$l('studio.import.title')}</h3>
                    </div>
                    <button className="close-btn" onClick={handleClose} disabled={isImporting}>×</button>
                </div>

                <div className="modal-body">
                    {isImporting ? (
                        <div className="importing-status">
                            <div className="loading-spinner"></div>
                            <p className="importing-text">正在导入项目...</p>
                            <p className="importing-hint">
                                {importType === 'zipfile'
                                    ? '正在上传并解压 ZIP 文件'
                                    : importType === 'zipurl'
                                    ? '正在下载并解压 ZIP 文件'
                                    : '正在从 AI Studio 获取项目'}
                            </p>
                        </div>
                    ) : successMessage ? (
                        <div className="success-status">
                            <div className="success-icon">✓</div>
                            <p className="success-text">{successMessage}</p>
                        </div>
                    ) : (
                        <>
                            <p className="description">{$l('studio.import.description')}</p>

                            <div className="import-type-tabs">
                        <button
                            className={`type-tab ${importType === 'aistudio' ? 'active' : ''}`}
                            onClick={() => handleTypeChange('aistudio')}
                        >
                            AI Studio 链接
                        </button>
                        <button
                            className={`type-tab ${importType === 'zipurl' ? 'active' : ''}`}
                            onClick={() => handleTypeChange('zipurl')}
                        >
                            ZIP 链接
                        </button>
                        <button
                            className={`type-tab ${importType === 'zipfile' ? 'active' : ''}`}
                            onClick={() => handleTypeChange('zipfile')}
                        >
                            上传 ZIP
                        </button>
                    </div>

                    {importType !== 'zipfile' ? (
                        <div className="input-group">
                            <div className="input-wrapper">
                                <input
                                    type="text"
                                    value={url}
                                    onChange={e => {
                                        setUrl(e.target.value);
                                        setError('');
                                    }}
                                    placeholder={
                                        importType === 'aistudio'
                                            ? 'https://aistudio.google.com/...'
                                            : 'https://example.com/project.zip'
                                    }
                                    className={error ? 'error' : ''}
                                />
                                <button className="paste-btn" onClick={handlePaste} title={$l('studio.import.paste')}>
                                    粘贴
                                </button>
                            </div>
                            {error && <span className="error-msg">{error}</span>}
                        </div>
                    ) : (
                        <div className="file-upload-group">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".zip"
                                onChange={handleFileSelect}
                                style={{ display: 'none' }}
                            />
                            <div className="file-upload-area" onClick={handleFileClick}>
                                {selectedFile ? (
                                    <div className="file-selected">
                                        <span className="file-icon">📦</span>
                                        <div className="file-info">
                                            <span className="file-name">{selectedFile.name}</span>
                                            <span className="file-size">
                                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="file-placeholder">
                                        <span className="upload-icon">📁</span>
                                        <span className="upload-text">点击选择 ZIP 文件</span>
                                        <span className="upload-hint">或拖拽文件到此处</span>
                                    </div>
                                )}
                            </div>
                            {error && <span className="error-msg">{error}</span>}
                        </div>
                    )}

                            <div className="supported-types">
                                <span>支持的格式:</span>
                                <span className="type-tag">
                                    Google AI Studio
                                </span>
                                <span className="type-tag">
                                    ZIP 文件
                                </span>
                            </div>
                        </>
                    )}
                </div>

                {!isImporting && !successMessage && (
                    <div className="modal-footer">
                        <button className="cancel-btn" onClick={handleClose}>
                            {$l('common.cancel')}
                        </button>
                        <button
                            className="confirm-btn"
                            onClick={handleSubmit}
                            disabled={importType === 'zipfile' ? !selectedFile : !url.trim()}
                        >
                            {$l('common.import')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
