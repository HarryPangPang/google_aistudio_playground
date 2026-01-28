import React, { useState, useEffect } from 'react';
import { IconTrash, IconFolder } from '../../components/Icons';
import { useI18n } from '../../context/I18nContext';
import { DEFAULT_PLATFORM, getPlatformById } from '../../config/platforms';
import { canContinueChat, canPreview, getProjectTitle, type Project } from '../../types/project';
import { loadAndMigrateProjects } from '../../utils/projectMigration';
import './Projects.scss';

export const Projects: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const { t } = useI18n();

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = () => {
        try {
            // 使用迁移函数加载和升级旧数据
            const migratedProjects = loadAndMigrateProjects();
            setProjects(migratedProjects);
        } catch (e) {
            console.error('Failed to load projects:', e);
            // 降级处理：直接加载原始数据
            try {
                const history = JSON.parse(localStorage.getItem('chat_history') || '[]');
                setProjects(history);
            } catch (fallbackError) {
                console.error('Fallback also failed:', fallbackError);
                setProjects([]);
            }
        }
    };

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm(t.projects.deleteConfirm)) {
            const newProjects = projects.filter(p => (p.id || p.driveid) !== id);
            localStorage.setItem('chat_history', JSON.stringify(newProjects));
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

    return (
        <div className="projects-container">
            <h1 className="projects-title">{t.projects.title}</h1>
            
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

                        // Debug log
                        console.log('Project:', {
                            id: projectId,
                            driveid: project.driveid,
                            type: project.type,
                            canContinue: canContinueChat(project),
                            canPreview: canPreview(project)
                        });

                        return (
                            <div
                                key={projectId}
                                className="project-card"
                            >
                                <div className="card-header">
                                    <div className="project-icon">
                                        <IconFolder />
                                    </div>
                                    <button
                                        onClick={(e) => handleDelete(projectId, e)}
                                        className="delete-btn"
                                    >
                                        <IconTrash className="delete-icon" />
                                    </button>
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
        </div>
    );
};
