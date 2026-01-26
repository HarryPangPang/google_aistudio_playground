import React, { useState, useEffect } from 'react';
import { IconTrash, IconFolder } from '../../components/Icons';
import './Projects.scss';

export const Projects: React.FC = () => {
    const [projects, setProjects] = useState<any[]>([]);

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
        if (window.confirm('Are you sure you want to delete this project?')) {
            const newProjects = projects.filter(p => p.driveid !== id);
            localStorage.setItem('chat_history', JSON.stringify(newProjects));
            setProjects(newProjects);
        }
    };

    const handleOpenProject = (id: string) => {
        window.location.href = `/?driveid=${id}`;
    };

    return (
        <div className="projects-container">
            <h1 className="projects-title">My Projects</h1>
            
            {projects.length === 0 ? (
                <div className="projects-empty-state">
                    <IconFolder className="mx-auto mb-4 empty-icon" />
                    <p>No projects yet. Create one to get started!</p>
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
                                {project.prompt && project.prompt[0] ? project.prompt[0] : 'Untitled Project'}
                            </h3>
                            
                            <p className="project-date">
                                Created: {new Date(project.createdAt).toLocaleDateString()}
                            </p>
                            {project.updatedAt && (
                                <p className="project-updated">
                                    Updated: {new Date(project.updatedAt).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
