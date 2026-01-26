import React from 'react';
import './Rank.scss';

export default function Rank() {
    return (
        <div className="rank-container">
            <h1 className="rank-title">Hot Game Ranking</h1>
            
            <div className="rank-list">
                {[1, 2, 3, 4, 5].map((rank, index) => (
                    <div key={rank} className={`rank-item ${index < 4 ? 'has-border' : ''}`}>
                        <div className={`rank-number ${index < 3 ? 'top-3' : ''}`}>
                            {rank}
                        </div>
                        <div className="game-icon-placeholder" />
                        <div className="rank-info">
                            <h3 className="game-title">Cyber Adventure {rank}</h3>
                            <p className="game-meta">1.2M Players • 4.8 Rating</p>
                        </div>
                        <button className="play-button">
                            Play
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
