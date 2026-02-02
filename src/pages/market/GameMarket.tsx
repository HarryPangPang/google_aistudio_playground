import React, { useState, useEffect } from 'react';
import { useI18n } from '../../context/I18nContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { IconShare } from '../../components/Icons';
import './Market.scss';

interface GameStats {
    [gameId: string]: number;
}

export const GameMarket: React.FC = () => {
    const { $l } = useI18n();
    const { user } = useAuth();
    const [games, setGames] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [gameStats, setGameStats] = useState<GameStats>({});
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [shareUrl, setShareUrl] = useState('');
    const [copied, setCopied] = useState(false);
    const [currentGameId, setCurrentGameId] = useState<string>('');

    useEffect(() => {
        const fetchGames = async () => {
            try {
                const res: any = await api.getBuildRecord();
                if (res.success) {
                    setGames(res.data);
                    // Fetch stats for each game
                    await fetchGameStats(res.data);

                    // Check if there's a game_id in URL and auto-open
                    const hash = window.location.hash;
                    const searchIndex = hash.indexOf('?');
                    if (searchIndex !== -1) {
                        const search = hash.substring(searchIndex);
                        const params = new URLSearchParams(search);
                        const gameId = params.get('game_id');
                        if (gameId) {
                            // Find and open the game
                            const game = res.data.find((g: any) => g.id === gameId);
                            if (game) {
                                handlePlayGame(gameId);
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to load games:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchGames();
    }, []);

    const fetchGameStats = async (gameList: any[]) => {
        const stats: GameStats = {};
        for (const game of gameList) {
            try {
                const res: any = await api.getGameStats(game.id);
                if (res.success && res.data) {
                    stats[game.id] = res.data.playCount || 0;
                }
            } catch (error) {
                console.error(`Failed to load stats for game ${game.id}:`, error);
                stats[game.id] = 0;
            }
        }
        setGameStats(stats);
    };

    const handlePlayGame = (id: string) => {
        // Add current user ID for tracking
        const userId = user?.id || '';
        const url = userId
            ? `/deployments/${id}/?shared_by=${userId}`
            : `/deployments/${id}/`;
        window.open(url, '_blank');
    };

    const handleShare = (game: any, e: React.MouseEvent) => {
        e.stopPropagation();
        const gameId = game.id;
        const userId = user?.id || '';
        const baseUrl = window.location.origin;
        // 直接分享游戏部署页面的链接，带上分享者ID
        const url = `${baseUrl}/deployments/${gameId}/?shared_by=${userId}`;
        setShareUrl(url);
        setCurrentGameId(gameId);
        setShareModalOpen(true);
        setCopied(false);
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareUrl).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handleCloseModal = () => {
        setShareModalOpen(false);
        setCopied(false);
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
                        {/* Cover Image */}
                        <div className="game-cover">
                            {game.cover_url ? (
                                <img
                                    src={`/deployments/${game.id}/cover.png`}
                                    alt={game.file_name}
                                    className="cover-image"
                                    loading="lazy"
                                />
                            ) : (
                                <div className="cover-placeholder">
                                    <span className="cover-icon">🎮</span>
                                </div>
                            )}
                        </div>

                        <div className="card-header">
                            <h3 className="card-title" title={game.file_name}>
                                {game.file_name.replace(/\.(zip|rar)$/i, '')}
                            </h3>
                            <button
                                onClick={(e) => handleShare(game, e)}
                                className="share-btn-icon"
                                title={$l('market.share')}
                            >
                                <IconShare />
                            </button>
                        </div>
                        <div className="card-info">
                            {game.username && (
                                <div className="info-row">
                                    <span className="info-label">👤 {$l('market.creator')}:</span>
                                    <span className="creator-name">
                                        {game.username}
                                    </span>
                                </div>
                            )}
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
                            <div className="info-row">
                                <span className="info-label">👥</span>
                                <span className="play-count">
                                    {gameStats[game.id] || 0} {$l('market.playedBy')}
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

            {/* Share Modal */}
            {shareModalOpen && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{$l('market.shareTitle')}</h2>
                            <button onClick={handleCloseModal} className="modal-close">×</button>
                        </div>
                        <div className="modal-body">
                            <p className="modal-description">{$l('market.shareDesc')}</p>
                            <div className="share-url-container">
                                <input
                                    type="text"
                                    value={shareUrl}
                                    readOnly
                                    className="share-url-input"
                                />
                                <button
                                    onClick={handleCopyLink}
                                    className="copy-btn"
                                >
                                    {copied ? $l('market.copied') : $l('market.copyLink')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
