import React, { useState, useEffect } from 'react';
import { IconTrash, IconFolder, IconShare } from '../../components/Icons';
import { useI18n } from '../../context/I18nContext';
import { useAuth } from '../../context/AuthContext';
import { DEFAULT_PLATFORM, getPlatformById } from '../../config/platforms';
import { canContinueChat, canPreview, getProjectTitle, type Project } from '../../types/project';
import { loadAndMigrateProjects } from '../../utils/projectMigration';
import { api } from '../../services/api';
import './Projects.scss';

export const Projects: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const { t } = useI18n();
    const { user } = useAuth();
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [shareUrl, setShareUrl] = useState('');
    const [copied, setCopied] = useState(false);
    const [isMigrating, setIsMigrating] = useState(false);

    useEffect(() => {
        // 先尝试迁移，然后加载项目
        migrateLocalStorageProjects().then(() => {
            loadProjects();
        });
    }, []);

    // 迁移 localStorage 中的项目到数据库
    const migrateLocalStorageProjects = async () => {
        // 检查是否已经迁移过
        const migrated = localStorage.getItem('projects_migrated');
        if (migrated === 'true') {
            return; // 已经迁移过，跳过
        }

        try {
            setIsMigrating(true);

            // 从 localStorage 加载项目
            const history = JSON.parse(localStorage.getItem('chat_history') || '[]');

            if (history.length === 0) {
                // 没有项目需要迁移
                localStorage.setItem('projects_migrated', 'true');
                return;
            }

            console.log(`开始迁移 ${history.length} 个项目到数据库...`);

            // 使用迁移函数加载和升级旧数据
            const migratedProjects = loadAndMigrateProjects();

            // 调用 API 批量迁移
            const response: any = await api.migrateProjects(migratedProjects);

            if (response && response.success) {
                console.log('迁移成功:', response.data);
                // 标记为已迁移
                localStorage.setItem('projects_migrated', 'true');
            }
        } catch (error) {
            console.error('迁移项目失败:', error);
            // 即使失败也不阻止用户使用
        } finally {
            setIsMigrating(false);
        }
    };

    const loadProjects = async () => {
        try {
            // 优先从 API 加载项目
            const response: any = await api.getProjects();
            if (response && response.success && response.data) {
                // 转换数据格式以匹配前端 Project 类型
                const apiProjects = response.data.map((p: any) => ({
                    id: p.id,
                    driveid: p.driveid,
                    type: p.type,
                    platformId: p.platform_id,
                    title: p.title,
                    prompt: p.prompt,
                    chatContent: p.chat_content,
                    deployUrl: p.deploy_url,
                    deployType: p.deploy_type,
                    status: p.status,
                    model: p.model || (p.model_label && p.model_value !== undefined ? {
                        label: p.model_label,
                        value: p.model_value
                    } : undefined),
                    files: p.files,
                    sourceUrl: p.source_url,
                    createdAt: p.created_at,
                    updatedAt: p.updated_at
                }));
                setProjects(apiProjects);
                return;
            }
        } catch (e) {
            console.error('Failed to load projects from API:', e);
        }

        // 后备方案：从 localStorage 加载
        try {
            const migratedProjects = loadAndMigrateProjects();
            setProjects(migratedProjects);
        } catch (e) {
            console.error('Failed to load projects from localStorage:', e);
            // 最后降级处理：直接加载原始数据
            try {
                const history = JSON.parse(localStorage.getItem('chat_history') || '[]');
                setProjects(history);
            } catch (fallbackError) {
                console.error('All fallbacks failed:', fallbackError);
                setProjects([]);
            }
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm(t.projects.deleteConfirm)) {
            try {
                // 先从 API 删除
                await api.deleteProject(id);
            } catch (error) {
                console.error('Failed to delete from API:', error);
            }

            // 同时从 localStorage 删除
            try {
                const history = JSON.parse(localStorage.getItem('chat_history') || '[]');
                const newHistory = history.filter((p: any) => (p.id || p.driveid) !== id);
                localStorage.setItem('chat_history', JSON.stringify(newHistory));
            } catch (error) {
                console.error('Failed to delete from localStorage:', error);
            }

            // 更新UI
            const newProjects = projects.filter(p => (p.id || p.driveid) !== id);
            setProjects(newProjects);
        }
    };

    const handleContinueChat = (project: Project, e: React.MouseEvent) => {
        e.stopPropagation();
        // 使用 hash 路由格式，参数放在 hash 后面
        if (project.driveid) {
            window.location.href = `/#/?driveid=${project.driveid}`;
        }
    };

    const handlePreview = (project: Project, e: React.MouseEvent) => {
        e.stopPropagation();
        if (project.deployUrl) {
            window.open(project.deployUrl, '_blank');
        }
    };

    const handleShare = (project: Project, e: React.MouseEvent) => {
        e.stopPropagation();
        const projectId = project.id || project.driveid || '';
        const userId = user?.id || '';
        // 生成分享链接，包含项目ID和用户ID
        const baseUrl = window.location.origin;
        const url = `${baseUrl}/#/?projectId=${projectId}&userId=${userId}`;
        setShareUrl(url);
        setShareModalOpen(true);
        setCopied(false);
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareUrl).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handleCloseModal = () => {
        setShareModalOpen(false);
        setCopied(false);
    };

    return (
        <div className="projects-container">
            <h1 className="projects-title">{t.projects.title}</h1>

            {isMigrating && (
                <div className="migration-notice">
                    <p>正在迁移项目数据到服务器...</p>
                </div>
            )}

            {projects.length === 0 ? (
                <div className="projects-empty-state">
                    <IconFolder className="mx-auto mb-4 empty-icon" />
                    <p>{t.projects.empty}</p>
                </div>
            ) : (
                <div className="projects-grid">
                    {projects.map((project, index) => {
                        const platform = project.platformId
                            ? getPlatformById(project.platformId)
                            : DEFAULT_PLATFORM;
                        const projectId = project.id || project.driveid || `project-${index}`;

                        return (
                            <div
                                key={projectId}
                                className="project-card"
                            >
                                <div className="card-header">
                                    <div className="project-icon">
                                        <IconFolder />
                                    </div>
                                    <div className="card-actions">
                                        {/* <button
                                            onClick={(e) => handleShare(project, e)}
                                            className="share-btn"
                                            title={t.projects.share}
                                        >
                                            <IconShare className="share-icon" />
                                        </button> */}
                                        <button
                                            onClick={(e) => handleDelete(projectId, e)}
                                            className="delete-btn"
                                        >
                                            <IconTrash className="delete-icon" />
                                        </button>
                                    </div>
                                </div>

                                <div className="platform-badge">
                                    <span className="platform-icon">{platform?.icon || DEFAULT_PLATFORM.icon}</span>
                                    <span className="platform-label">{platform?.displayName || DEFAULT_PLATFORM.displayName}</span>
                                </div>

                                <h3 className="project-title">
                                    {getProjectTitle(project)}
                                </h3>

                                <p className="project-date">
                                    {t.projects.created}: {new Date(project.createdAt).toLocaleDateString()}
                                </p>
                                {project.updatedAt && (
                                    <p className="project-updated">
                                        {t.projects.updated}: {new Date(project.updatedAt).toLocaleDateString()}
                                    </p>
                                )}

                                {/* Action buttons */}
                                <div className="project-actions">
                                    {canPreview(project) && (
                                        <button
                                            onClick={(e) => handlePreview(project, e)}
                                            className="action-btn preview-btn"
                                            title="Preview"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                <circle cx="12" cy="12" r="3"></circle>
                                            </svg>
                                            Preview
                                        </button>
                                    )}
                                    {canContinueChat(project) && (
                                        <button
                                            onClick={(e) => handleContinueChat(project, e)}
                                            className="action-btn continue-btn"
                                            title="Continue chat"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                            </svg>
                                            Continue
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Share Modal */}
            {shareModalOpen && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{t.projects.shareTitle}</h2>
                            <button onClick={handleCloseModal} className="modal-close">×</button>
                        </div>
                        <div className="modal-body">
                            <p className="modal-description">{t.projects.shareDesc}</p>
                            <div className="share-url-container">
                                <input
                                    type="text"
                                    value={shareUrl}
                                    readOnly
                                    className="share-url-input"
                                />
                                <button
                                    onClick={handleCopyLink}
                                    className="copy-btn"
                                >
                                    {copied ? t.projects.copied : t.projects.copyLink}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
