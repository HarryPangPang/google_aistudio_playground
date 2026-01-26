import React from 'react';
import { useI18n } from '../../context/I18nContext';
import './Earnings.scss';

export const Earnings: React.FC = () => {
    const { $l } = useI18n();

    return (
        <div className="earnings-container">
            <div className="header-section">
                <h1>{$l('earnings.title')}</h1>
                <button className="upgrade-btn">
                    <span>💎</span> {$l('earnings.upgrade')}
                </button>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-label">{$l('earnings.totalRevenue')}</div>
                    <div className="stat-value">¥1,240.50</div>
                    <div className="stat-change positive">+12.5% {$l('earnings.time.thisMonth')}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">{$l('earnings.activePlayers')}</div>
                    <div className="stat-value">8,432</div>
                    <div className="stat-change positive">+5.2% {$l('earnings.time.thisWeek')}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">{$l('earnings.avgPlaytime')}</div>
                    <div className="stat-value">14m 20s</div>
                    <div className="stat-change neutral">0.0% {$l('earnings.time.change')}</div>
                </div>
            </div>

            <div className="main-grid">
                <div className="chart-section">
                    <h3>{$l('earnings.revenueTrends')}</h3>
                    <div className="chart-placeholder">
                        <div className="bars">
                            {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                                <div key={i} className="bar" style={{ height: `${h}%` }} />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="revenue-sources">
                    <h3>{$l('earnings.revenueSources')}</h3>
                    <div className="source-item">
                        <div className="source-info">
                            <div className="icon">🎮</div>
                            <span className="name">{$l('earnings.inGamePurchases')}</span>
                        </div>
                        <span className="amount">¥840.00</span>
                    </div>
                    <div className="source-item">
                        <div className="source-info">
                            <div className="icon">📺</div>
                            <span className="name">{$l('earnings.adRevenue')}</span>
                        </div>
                        <span className="amount">¥320.50</span>
                    </div>
                    <div className="source-item">
                        <div className="source-info">
                            <div className="icon">🤝</div>
                            <span className="name">{$l('earnings.creatorFund')}</span>
                        </div>
                        <span className="amount">¥80.00</span>
                    </div>
                </div>
            </div>

            <div className="pro-banner">
                <div className="content">
                    <h2>{$l('earnings.proTitle')}</h2>
                    <p>{$l('earnings.proDesc')}</p>
                </div>
                <button>{$l('earnings.getPro')}</button>
            </div>
        </div>
    );
};
