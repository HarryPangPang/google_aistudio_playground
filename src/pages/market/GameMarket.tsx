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
                        className="market-card compact"
                        onClick={() => handlePlayGame(game.id)}
                    >
                        <div className="card-header">
                            <span className="game-icon-small">🎮</span>
                            <h3 className="card-title" title={game.file_name}>
                                {game.file_name.replace(/\.(zip|rar)$/i, '')}
                            </h3>
                        </div>
                        <div className="card-info">
                            <div className="info-row">
                                <span className="info-label">{$l('market.time')}:</span>
                                <span className="game-date">
                                    {new Date(parseInt(game.create_time)).toLocaleString('zh-CN', {
                                        year: 'numeric',
                                        month: '2-digit',
                                        day: '2-digit',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">{$l('market.status')}:</span>
                                <span className={`status-badge ${game.is_processed === 1 ? 'success' : 'pending'}`}>
                                    {game.is_processed === 1
                                        ? `✓ ${$l('market.statusSuccess')}`
                                        : `⋯ ${$l('market.statusPending')}`}
                                </span>
                            </div>
                        </div>
                        <button className="play-button-compact">
                            <span>▶</span> {$l('market.playGame')}
                        </button>
                    </div>
                ))}

                {games.length === 0 && (
                    <div className="no-games">
                        {$l('market.noGames')}
                    </div>
                )}
            </div>
        </div>
    );
};
