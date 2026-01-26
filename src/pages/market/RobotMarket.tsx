import React from 'react';
import { useI18n } from '../../context/I18nContext';
import './Market.scss';

export const RobotMarket: React.FC = () => {
    const { $l } = useI18n();

    return (
        <div className="market-container">
            <h1 className="market-title">{$l('market.robotTitle')}</h1>
            <div className="market-grid">
                {/* Placeholders */}
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="market-card clickable">
                        <div className="robot-icon-placeholder">
                            AI
                        </div>
                        <h3 className="card-title">{$l('market.template')} {i}</h3>
                        <p className="card-description">
                            {$l('market.robotDesc')}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};
