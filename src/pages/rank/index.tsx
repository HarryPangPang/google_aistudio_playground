import React from 'react';
import { useI18n } from '../../context/I18nContext';
import './Rank.scss';

export default function Rank() {
    const { $l } = useI18n();

    return (
        <div className="rank-container">
            <h1 className="rank-title">{$l('rank.title')}</h1>
            
            <div className="rank-list">
                {[1, 2, 3, 4, 5].map((rank, index) => (
                    <div key={rank} className={`rank-item ${index < 4 ? 'has-border' : ''}`}>
                        <div className={`rank-number ${index < 3 ? 'top-3' : ''}`}>
                            {rank}
                        </div>
                        <div className="game-icon-placeholder" />
                        <div className="rank-info">
                            <h3 className="game-title">Cyber Adventure {rank}</h3>
                            <p className="game-meta">1.2M {$l('rank.players')} • 4.8 {$l('rank.rating')}</p>
                        </div>
                        <button className="play-button">
                            {$l('rank.play')}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
