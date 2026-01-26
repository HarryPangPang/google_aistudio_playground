import React from 'react';
import { useI18n } from '../../context/I18nContext';
import './Market.scss';

export const GameMarket: React.FC = () => {
    const { $l } = useI18n();

    return (
        <div className="market-container">
            <h1 className="market-title">{$l('market.gameTitle')}</h1>
            <div className="market-grid">
                {/* Placeholders */}
                {[1, 2, 3].map(i => (
                    <div key={i} className="market-card">
                        <div className="game-image-placeholder" />
                        <h3 className="card-title">{$l('market.title')} {i}</h3>
                        <p className="card-description">
                            {$l('market.gameDesc')}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};
