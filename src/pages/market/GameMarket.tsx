import React from 'react';
import './Market.scss';

export const GameMarket: React.FC = () => {
    return (
        <div className="market-container">
            <h1 className="market-title">Game Market</h1>
            <div className="market-grid">
                {/* Placeholders */}
                {[1, 2, 3].map(i => (
                    <div key={i} className="market-card">
                        <div className="game-image-placeholder" />
                        <h3 className="card-title">Game Title {i}</h3>
                        <p className="card-description">
                            Adventure • Action
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};
