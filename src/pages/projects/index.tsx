import React, { useState, useEffect } from 'react';
import { IconTrash, IconFolder } from '../../components/Icons';
import { useI18n } from '../../context/I18nContext';
import './Projects.scss';

export const Projects: React.FC = () => {
    const [projects, setProjects] = useState<any[]>([]);
    const { t } = useI18n();

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = () => {
        try {
            const history = JSON.parse(localStorage.getItem('chat_history') || '[]');
            setProjects(history);
        } catch (e) {
            console.error('Failed to load projects:', e);
        }
    };

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm(t.projects.deleteConfirm)) {
            const newProjects = projects.filter(p => p.driveid !== id);
            localStorage.setItem('chat_history', JSON.stringify(newProjects));
            setProjects(newProjects);
        }
    };

    const handleOpenProject = (id: string) => {
        // 使用 hash 路由格式，参数放在 hash 后面
        window.location.href = `/#/?driveid=${id}`;
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
                    {projects.map((project, index) => (
                        <div 
                            key={project.driveid || index}
                            onClick={() => handleOpenProject(project.driveid)}
                            className="project-card"
                        >
                            <div className="card-header">
                                <div className="project-icon">
                                    <IconFolder />
                                </div>
                                <button
                                    onClick={(e) => handleDelete(project.driveid, e)}
                                    className="delete-btn"
                                >
                                    <IconTrash className="delete-icon" />
                                </button>
                            </div>
                            
                            <h3 className="project-title">
                                {project.prompt && project.prompt[0] ? project.prompt[0] : t.projects.untitled}
                            </h3>
                            
                            <p className="project-date">
                                {t.projects.created}: {new Date(project.createdAt).toLocaleDateString()}
                            </p>
                            {project.updatedAt && (
                                <p className="project-updated">
                                    {t.projects.updated}: {new Date(project.updatedAt).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
