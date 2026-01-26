import React from 'react';
import './Earnings.scss';

export const Earnings: React.FC = () => {
    return (
        <div className="earnings-container">
            <div className="header-section">
                <h1>Creator Earnings</h1>
                <button className="upgrade-btn">
                    <span>💎</span> Upgrade to Pro
                </button>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-label">Total Revenue</div>
                    <div className="stat-value">$1,240.50</div>
                    <div className="stat-change positive">+12.5% this month</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Active Players</div>
                    <div className="stat-value">8,432</div>
                    <div className="stat-change positive">+5.2% this week</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Avg. Playtime</div>
                    <div className="stat-value">14m 20s</div>
                    <div className="stat-change neutral">0.0% change</div>
                </div>
            </div>

            <div className="main-grid">
                <div className="chart-section">
                    <h3>Revenue Trends</h3>
                    <div className="chart-placeholder">
                        <div className="bars">
                            {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                                <div key={i} className="bar" style={{ height: `${h}%` }} />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="revenue-sources">
                    <h3>Revenue Sources</h3>
                    <div className="source-item">
                        <div className="source-info">
                            <div className="icon">🎮</div>
                            <span className="name">In-Game Purchases</span>
                        </div>
                        <span className="amount">$840.00</span>
                    </div>
                    <div className="source-item">
                        <div className="source-info">
                            <div className="icon">📺</div>
                            <span className="name">Ad Revenue</span>
                        </div>
                        <span className="amount">$320.50</span>
                    </div>
                    <div className="source-item">
                        <div className="source-info">
                            <div className="icon">🤝</div>
                            <span className="name">Creator Fund</span>
                        </div>
                        <span className="amount">$80.00</span>
                    </div>
                </div>
            </div>

            <div className="pro-banner">
                <div className="content">
                    <h2>Boost Your Earnings with Pro</h2>
                    <p>Get access to GPT-4, 0% platform fees on tips, and advanced analytics to grow your game empire.</p>
                </div>
                <button>Get Pro Access</button>
            </div>
        </div>
    );
};
