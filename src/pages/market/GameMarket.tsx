import React, { useState, useEffect } from 'react';
import { useI18n } from '../../context/I18nContext';
import { api } from '../../services/api';
import './Market.scss';

export const GameMarket: React.FC = () => {
    const { $l } = useI18n();
    const [games, setGames] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGames = async () => {
            try {
                const res: any = await api.getBuildRecord();
                if (res.success) {
                    setGames(res.data);
                }
            } catch (error) {
                console.error('Failed to load games:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchGames();
    }, []);

    const handlePlayGame = (id: string) => {
        window.open(`/deployments/${id}/`, '_blank');
    };

    if (loading) {
        return (
            <div className="market-container">
                <h1 className="market-title">{$l('market.gameTitle')}</h1>
                <div className="market-loading">Loading...</div>
            </div>
        );
    }

    return (
        <div className="market-container">
            <h1 className="market-title">{$l('market.gameTitle')}</h1>
            <div className="market-grid">
                {games.map((game) => (
                    <div 
                        key={game.id} 
                        className="market-card"
                        onClick={() => handlePlayGame(game.id)}
                    >
                        <div className="game-image-placeholder">
                            <span className="game-icon">🎮</span>
                        </div>
                        <div className="card-content">
                            <h3 className="card-title" title={game.file_name}>
                                {game.file_name.replace(/\.(zip|rar)$/i, '')}
                            </h3>
                            <p className="card-description">
                                {$l('market.gameDesc')}
                            </p>
                            <div className="card-footer">
                                <span className="game-date">
                                    {new Date(parseInt(game.create_time)).toLocaleString()}
                                </span>
                                <button className="play-button">Play</button>
                            </div>
                        </div>
                    </div>
                ))}
                
                {games.length === 0 && (
                    <div className="no-games">
                        No games available yet.
                    </div>
                )}
            </div>
        </div>
    );
};
