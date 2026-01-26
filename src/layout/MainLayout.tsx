import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { IconPlus, IconRobot, IconGame, IconTrophy, IconFolder, IconChart } from '../components/Icons';
import { useLayout } from '../context/LayoutContext';
import { useI18n } from '../context/I18nContext';
import monsterImg from '../assets/monster.png';
import './MainLayout.scss';

interface MainLayoutProps {
    children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { sidebarCollapsed } = useLayout();
    const { t, language, setLanguage } = useI18n();
    
    const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
    const langMenuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
                setIsLangMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const languages = [
        { code: 'zh-CN', label: '简体中文', flag: '🇨🇳' },
        { code: 'en-US', label: 'English', flag: '🇺🇸' },
    ] as const;

    const currentLang = languages.find(l => l.code === language) || languages[0];

    const menuItems = [
        { id: 'create', label: t.menu.create, icon: IconPlus, path: '/' },
        { id: 'projects', label: t.menu.projects, icon: IconFolder, path: '/projects' },
        { id: 'earnings', label: t.menu.earnings, icon: IconChart, path: '/earnings' },
        { id: 'robot-market', label: t.menu.robotMarket, icon: IconRobot, path: '/robot-market' },
        { id: 'game-market', label: t.menu.gameMarket, icon: IconGame, path: '/game-market' },
        { id: 'ranking', label: t.menu.ranking, icon: IconTrophy, path: '/ranking' },
    ];

    const isPathActive = (path: string) => {
        // Special case for "Create Project": only active if root path AND no search params (specifically no driveid)
        if (path === '/') {
            return location.pathname === '/' && !location.search.includes('driveid');
        }
        
        // Special case for "My Projects": active if path matches OR if we are editing a project (root path WITH driveid)
        if (path === '/projects') {
            return location.pathname.startsWith(path) || (location.pathname === '/' && location.search.includes('driveid'));
        }

        if (location.pathname.startsWith(path)) return true;
        return false;
    };

    return (
        <div className="main-layout">
            {/* Sidebar */}
            <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : 'expanded'}`}>
                {/* Brand / Logo */}
                <div className="brand-section">
                    <div className="logo-container">
                        <img src={monsterImg} alt="Monster" />
                    </div>
                    {!sidebarCollapsed && (
                        <div className="brand-text">
                            <h1>AI Studio</h1>
                            <span>Playground</span>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav className="nav-section">
                    <div className="menu-list">
                        {menuItems.map(item => {
                            const isActive = isPathActive(item.path);
                            const Icon = item.icon;
                            
                            const isCreateBtn = item.id === 'create';
                            const btnClass = `menu-btn ${isCreateBtn ? 'create-btn' : ''} ${isActive ? 'active' : ''}`;

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => navigate(item.path)}
                                    title={sidebarCollapsed ? item.label : ''}
                                    className={btnClass}
                                >
                                    <Icon className={isActive ? '' : ''} />
                                    {!sidebarCollapsed && <span>{item.label}</span>}
                                </button>
                            );
                        })}
                    </div>
                </nav>

                {/* User / Settings (Bottom) */}
                <div className="user-section">
                    <div className="lang-switch-wrapper" ref={langMenuRef}>
                        <button 
                            className={`lang-btn ${isLangMenuOpen ? 'open' : ''}`}
                            onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                            title={sidebarCollapsed ? currentLang.label : ''}
                        >
                            <span className="flag">{currentLang.flag}</span>
                            {!sidebarCollapsed && (
                                <>
                                    <span className="label-text">{currentLang.label}</span>
                                    <span className="arrow">▼</span>
                                </>
                            )}
                        </button>

                        {isLangMenuOpen && (
                            <div className="lang-menu">
                                {languages.map((lang) => (
                                    <button
                                        key={lang.code}
                                        className={`menu-item ${language === lang.code ? 'active' : ''}`}
                                        onClick={() => {
                                            setLanguage(lang.code);
                                            setIsLangMenuOpen(false);
                                        }}
                                    >
                                        <span className="flag">{lang.flag}</span>
                                        <span>{lang.label}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="main-content">
                {children}
            </main>
        </div>
    );
};
