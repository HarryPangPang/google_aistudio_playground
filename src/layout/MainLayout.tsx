import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { IconPlus, IconRobot, IconGame, IconTrophy, IconFolder, IconChart } from '../components/Icons';
import monsterImg from '../assets/monster.png';

interface MainLayoutProps {
    children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { id: 'create', label: '创建项目', icon: IconPlus, path: '/' },
        { id: 'projects', label: '我的项目', icon: IconFolder, path: '/projects' },
        { id: 'earnings', label: '收益中心', icon: IconChart, path: '/earnings' },
        { id: 'robot-market', label: 'AI机器人市场', icon: IconRobot, path: '/robot-market' },
        { id: 'game-market', label: '游戏市场', icon: IconGame, path: '/game-market' },
        { id: 'ranking', label: '热门游戏排行榜', icon: IconTrophy, path: '/ranking' },
    ];

    const isPathActive = (path: string) => {
        if (path === '/' && location.pathname === '/') return true;
        if (path !== '/' && location.pathname.startsWith(path)) return true;
        return false;
    };

    return (
        <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#fff' }}>
            {/* Sidebar */}
            <div style={{
                width: '260px',
                borderRight: '1px solid #f0f0f0',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#fbfaff', // Very light purple tint
                flexShrink: 0
            }}>
                {/* Brand / Logo */}
                <div style={{
                    padding: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    borderBottom: '1px solid transparent'
                }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        backgroundColor: '#eee',
                        border: '2px solid #8B5CF6'
                    }}>
                        <img src={monsterImg} alt="Monster" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#1f1f1f' }}>AI Studio</h1>
                        <span style={{ fontSize: '12px', color: '#8B5CF6', fontWeight: 500 }}>Playground</span>
                    </div>
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, padding: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {menuItems.map(item => {
                            const isActive = isPathActive(item.path);
                            const Icon = item.icon;
                            
                            // Special styling for "Create" button
                            if (item.id === 'create') {
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => navigate(item.path)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            width: '100%',
                                            padding: '12px 16px',
                                            border: 'none',
                                            borderRadius: '12px',
                                            backgroundColor: isActive ? '#7C3AED' : '#fff',
                                            color: isActive ? '#fff' : '#4B5563',
                                            cursor: 'pointer',
                                            fontSize: '15px',
                                            fontWeight: 600,
                                            boxShadow: isActive ? '0 4px 12px rgba(124, 58, 237, 0.3)' : '0 1px 3px rgba(0,0,0,0.05)',
                                            transition: 'all 0.2s ease',
                                            marginBottom: '16px'
                                        }}
                                    >
                                        <Icon className={isActive ? '' : ''} />
                                        <span>{item.label}</span>
                                    </button>
                                );
                            }

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => navigate(item.path)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        width: '100%',
                                        padding: '10px 16px',
                                        border: 'none',
                                        borderRadius: '8px',
                                        backgroundColor: isActive ? '#EDE9FE' : 'transparent',
                                        color: isActive ? '#7C3AED' : '#4B5563',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: 500,
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={e => {
                                        if (!isActive) e.currentTarget.style.backgroundColor = '#F3F4F6';
                                    }}
                                    onMouseLeave={e => {
                                        if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                                    }}
                                >
                                    <Icon />
                                    <span>{item.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </nav>

                {/* User / Settings (Bottom) */}
                <div style={{ padding: '16px', borderTop: '1px solid #f0f0f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666', fontSize: '13px' }}>
                        {/* Placeholder for user info */}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
                {children}
            </main>
        </div>
    );
};
