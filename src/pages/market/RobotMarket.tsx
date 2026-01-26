import React from 'react';
import './Market.scss';

export const RobotMarket: React.FC = () => {
    return (
        <div className="market-container">
            <h1 className="market-title">AI Robot Market</h1>
            <div className="market-grid">
                {/* Placeholders */}
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="market-card clickable">
                        <div className="robot-icon-placeholder">
                            AI
                        </div>
                        <h3 className="card-title">Robot Template {i}</h3>
                        <p className="card-description">
                            A powerful AI assistant template for general tasks.
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};
