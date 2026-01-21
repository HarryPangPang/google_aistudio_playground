export const files: Record<string, string> = {
  'index.css': `
body {
    margin: 0;
    overflow: hidden;
    background-color: #1a1a1a;
    color: #ffffff;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
}
canvas {
    display: block;
    image-rendering: pixelated;
}
.pixel-border {
    border: 4px solid #333;
}
`,
  'index.tsx': `
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`,

  'App.tsx': `
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { TileType, GameState, PrisonerLevel, RegimeActivity, GameEvent } from './types';
import { COSTS, MAX_POLICE, MAX_RIOT_POLICE_CALLS, MAX_DEATHS, MAX_RIOTS } from './constants';
import GameEngine from './components/GameEngine';

const DEFAULT_REGIME: RegimeActivity[] = [
  'SLEEP', 'SLEEP', 'SLEEP', 'SLEEP', 'SLEEP', 'SLEEP',
  'EAT', 'EAT',
  'FREE', 'FREE', 'FREE', 'FREE',
  'EAT', 'EAT',
  'YARD', 'YARD', 'YARD', 'YARD',
  'SHOWER', 'SHOWER',
  'SLEEP', 'SLEEP', 'SLEEP', 'SLEEP'
];

const ACTIVITY_LABELS: Record<RegimeActivity, string> = {
  SLEEP: '就寝',
  EAT: '用餐',
  YARD: '放风',
  SHOWER: '洗浴',
  FREE: '自由'
};

const ACTIVITY_COLORS: Record<RegimeActivity, string> = {
  SLEEP: 'bg-blue-600',
  EAT: 'bg-orange-600',
  YARD: 'bg-emerald-600',
  SHOWER: 'bg-sky-500',
  FREE: 'bg-neutral-600'
};

const App: React.FC = () => {
  const [selectedTool, setSelectedTool] = useState<TileType | 'POLICE' | 'PATROL' | 'RIOT_CONTROL' | 'DELETE'>(TileType.WALL);
  const [showRegime, setShowRegime] = useState(false);
  const [gameState, setGameState] = useState<GameState>({
    money: 5000,
    time: 0,
    riotProbability: 0,
    deathCount: 0,
    escapedCount: 0,
    releasedCount: 0,
    riotOccurrenceCount: 0,
    isRiotActive: false,
    riotPoliceCallsUsed: 0,
    isGameOver: false,
    gameOverReason: '',
    currentRegime: '监狱运营中',
    regime: [...DEFAULT_REGIME],
    activeEvent: null,
    releaseTrigger: 0,
    readyToReleaseCount: 0
  });

  const [policeCount, setPoliceCount] = useState(0);
  const [prisonerCount, setPrisonerCount] = useState(0);

  const handleStateChange = useCallback((newState: Partial<GameState>) => {
    setGameState(prev => ({ ...prev, ...newState }));
  }, []);

  const handleCountsChange = useCallback((counts: { police: number, prisoners: number }) => {
    setPoliceCount(counts.police);
    setPrisonerCount(counts.prisoners);
  }, []);

  const closeEvent = () => {
    setGameState(prev => ({ ...prev, activeEvent: null }));
  };

  const triggerRelease = () => {
    setGameState(prev => ({ ...prev, releaseTrigger: (prev.releaseTrigger || 0) + 1 }));
  };

  const toggleRegimeHour = (hour: number) => {
    const activities: RegimeActivity[] = ['SLEEP', 'EAT', 'YARD', 'SHOWER', 'FREE'];
    const current = gameState.regime[hour];
    const nextIndex = (activities.indexOf(current) + 1) % activities.length;
    const newRegime = [...gameState.regime];
    newRegime[hour] = activities[nextIndex];
    setGameState(prev => ({ ...prev, regime: newRegime }));
  };

  const formatTime = (totalMinutes: number) => {
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const mins = totalMinutes % 60;
    return \`第 \${days + 1} 天 \${String(hours).padStart(2, '0')}:\${String(mins).padStart(2, '0')}\`;
  };

  if (gameState.isGameOver) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 p-8 text-center animate-in fade-in duration-1000">
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900 via-transparent to-transparent"></div>
        <h1 className="text-8xl font-black text-red-600 mb-2 tracking-tighter drop-shadow-2xl">任职终止</h1>
        <div className="w-24 h-1 bg-red-600 mb-8"></div>
        <p className="text-3xl text-neutral-300 mb-4 font-bold uppercase tracking-widest italic">{gameState.gameOverReason}</p>
        <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-sm mb-12 shadow-2xl scale-110">
          <p className="text-neutral-500 uppercase text-xs font-black tracking-[0.3em] mb-2">最终任职时长</p>
          <p className="text-5xl font-black text-white">{formatTime(gameState.time)}</p>
          <div className="grid grid-cols-2 gap-8 mt-6 border-t border-neutral-800 pt-6 text-left">
            <div>
               <p className="text-[10px] text-neutral-600 font-black uppercase">成功释放</p>
               <p className="text-2xl font-black text-green-500">{gameState.releasedCount} 人</p>
            </div>
            <div>
               <p className="text-[10px] text-neutral-600 font-black uppercase">越狱失职</p>
               <p className="text-2xl font-black text-rose-500">{gameState.escapedCount} 人</p>
            </div>
          </div>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="px-16 py-6 bg-red-600 text-white font-black text-2xl hover:bg-white hover:text-black transition-all uppercase tracking-[0.4em] shadow-[0_0_40px_rgba(220,38,38,0.4)]"
        >
          重新开始职业生涯
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-neutral-900 select-none text-neutral-200 font-sans">
      {gameState.activeEvent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300 px-4">
          <div className={\`max-w-md w-full p-8 border-2 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-sm transform transition-all scale-110
            \${gameState.activeEvent.type === 'POSITIVE' ? 'bg-emerald-950 border-emerald-500' : 
              gameState.activeEvent.type === 'NEGATIVE' ? 'bg-rose-950 border-rose-500' : 
              'bg-blue-950 border-blue-500'}\`}>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-4 opacity-60">
              {gameState.activeEvent.type === 'POSITIVE' ? '>>> 监狱喜讯 <<<' : 
               gameState.activeEvent.type === 'NEGATIVE' ? '>>> 紧急通告 <<<' : 
               '>>> 系统通知 <<<'}
            </p>
            <h2 className="text-4xl font-black text-white mb-4 tracking-tighter uppercase">{gameState.activeEvent.title}</h2>
            <p className="text-lg text-neutral-200 mb-8 leading-relaxed font-medium italic border-l-4 border-white/20 pl-4">
              {gameState.activeEvent.description}
            </p>
            <button 
              onClick={closeEvent}
              className={\`w-full py-4 font-black uppercase tracking-widest text-lg transition-all border
                \${gameState.activeEvent.type === 'POSITIVE' ? 'bg-emerald-500 text-emerald-950 hover:bg-white border-emerald-400' : 
                  gameState.activeEvent.type === 'NEGATIVE' ? 'bg-rose-600 text-white hover:bg-white hover:text-rose-900 border-rose-400' : 
                  'bg-blue-600 text-white hover:bg-white hover:text-blue-900 border-blue-400'}\`}
            >
              确 认
            </button>
          </div>
        </div>
      )}

      <div className="bg-black border-b border-neutral-800 p-4 flex justify-between items-center px-12 shadow-2xl z-10">
        <div className="flex gap-10">
          <StatBox label="可用资金" value={\`￥\${gameState.money.toLocaleString()}\`} color="text-green-500" />
          <StatBox label="当前日程" value={gameState.currentRegime} color="text-amber-400 animate-pulse" />
          <StatBox label="越狱成功" value={\`\${gameState.escapedCount} / 10\`} color={gameState.escapedCount > 7 ? 'text-red-500 animate-pulse' : 'text-rose-500'} />
          <StatBox label="当前时间" value={formatTime(gameState.time)} color="text-neutral-400" />
        </div>
        
        <div className="flex gap-10 items-center">
          <div className="w-56 bg-neutral-900 border border-neutral-800 h-6 rounded-sm overflow-hidden relative shadow-inner">
             <div 
               className={\`h-full transition-all duration-700 ease-out \${gameState.riotProbability > 75 ? 'bg-red-600 animate-pulse' : 'bg-amber-500'}\`}
               style={{ width: \`\${gameState.riotProbability}%\` }}
             />
             <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white uppercase tracking-widest drop-shadow-md">暴乱风险: {gameState.riotProbability}%</span>
          </div>
          <StatBox label="暴乱记录" value={\`\${gameState.riotOccurrenceCount} / \${MAX_RIOTS}\`} color={gameState.riotOccurrenceCount > 0 ? 'text-red-500' : 'text-neutral-500'} />
          <StatBox label="安保/囚犯" value={\`\${policeCount} / \${prisonerCount}\`} color="text-indigo-400" />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-80 bg-neutral-950 border-r border-neutral-800 p-6 flex flex-col gap-6 overflow-y-auto">
          <div className="flex gap-2">
            <button 
              onClick={() => setShowRegime(false)}
              className={\`flex-1 py-2 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all \${!showRegime ? 'border-white text-white bg-neutral-900' : 'border-transparent text-neutral-600'}\`}
            >
              建筑/人员
            </button>
            <button 
              onClick={() => setShowRegime(true)}
              className={\`flex-1 py-2 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all \${showRegime ? 'border-white text-white bg-neutral-900' : 'border-transparent text-neutral-600'}\`}
            >
              日程安排
            </button>
          </div>

          {!showRegime ? (
            <div className="animate-in slide-in-from-left duration-300 flex flex-col gap-6">
              <div>
                <h2 className="text-xs font-black text-neutral-600 uppercase tracking-widest mb-4 border-b border-neutral-800 pb-2">基础建设</h2>
                <div className="grid grid-cols-2 gap-3">
                  <ToolButton active={selectedTool === TileType.WALL} onClick={() => setSelectedTool(TileType.WALL)} label="墙壁" cost={COSTS.WALL} />
                  <ToolButton active={selectedTool === TileType.DOOR} onClick={() => setSelectedTool(TileType.DOOR)} label="监牢门" cost={COSTS.DOOR} />
                  <ToolButton active={selectedTool === TileType.BED} onClick={() => setSelectedTool(TileType.BED)} label="床铺" cost={COSTS.BED} />
                  <ToolButton active={selectedTool === TileType.TOILET} onClick={() => setSelectedTool(TileType.TOILET)} label="马桶" cost={COSTS.TOILET} />
                  <ToolButton active={selectedTool === TileType.SHOWER} onClick={() => setSelectedTool(TileType.SHOWER)} label="淋浴间" cost={COSTS.SHOWER} />
                  <ToolButton active={selectedTool === TileType.KITCHEN} onClick={() => setSelectedTool(TileType.KITCHEN)} label="厨房" cost={COSTS.KITCHEN} />
                  <ToolButton active={selectedTool === TileType.YARD} onClick={() => setSelectedTool(TileType.YARD)} label="放风场" cost={COSTS.YARD} />
                  <ToolButton active={selectedTool === 'DELETE'} onClick={() => setSelectedTool('DELETE')} label="拆除" color="bg-red-950/20 text-red-500 border-red-900/30" />
                </div>
              </div>

              <div>
                <h2 className="text-xs font-black text-neutral-600 uppercase tracking-widest mb-4 border-b border-neutral-800 pb-2">行政事务</h2>
                <button
                  onClick={triggerRelease}
                  disabled={!gameState.readyToReleaseCount}
                  className={\`w-full py-5 mb-4 rounded-sm border-2 transition-all flex flex-col items-center justify-center relative group
                    \${gameState.readyToReleaseCount ? 'bg-amber-500 border-amber-300 text-amber-950 hover:bg-white hover:border-white shadow-[0_0_20px_rgba(245,158,11,0.3)]' : 'bg-neutral-900 border-neutral-800 text-neutral-600 opacity-40 cursor-not-allowed'}\`}
                >
                  <span className="text-xs font-black uppercase tracking-widest">办理刑满释放</span>
                  <span className="text-[10px] font-bold opacity-80 mt-1 uppercase italic">待释放人数: {gameState.readyToReleaseCount}</span>
                  {gameState.readyToReleaseCount ? (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-[10px] font-black border-2 border-neutral-950 animate-bounce">
                      !
                    </div>
                  ) : null}
                </button>
                
                <h2 className="text-xs font-black text-neutral-600 uppercase tracking-widest mb-4 border-b border-neutral-800 pb-2">人事管理</h2>
                <div className="flex flex-col gap-3">
                  <ToolButton active={selectedTool === 'POLICE'} onClick={() => setSelectedTool('POLICE')} label="雇佣普通警察" cost={COSTS.POLICE} fullWidth />
                  <ToolButton active={selectedTool === 'PATROL'} onClick={() => setSelectedTool('PATROL')} label="规划巡逻路径" color="bg-blue-900/20 text-blue-400 border-blue-900/30" fullWidth />
                  <button
                    onClick={() => setSelectedTool('RIOT_CONTROL')}
                    disabled={gameState.riotPoliceCallsUsed >= MAX_RIOT_POLICE_CALLS || !gameState.isRiotActive}
                    className={\`w-full py-4 text-xs font-black rounded-sm border transition-all uppercase tracking-widest
                      \${selectedTool === 'RIOT_CONTROL' ? 'bg-red-600 text-white border-red-400 animate-pulse' : 'bg-red-900/20 text-red-600 border-red-900/30'}
                      \${(gameState.riotPoliceCallsUsed >= MAX_RIOT_POLICE_CALLS || !gameState.isRiotActive) ? 'opacity-20 grayscale cursor-not-allowed' : 'hover:bg-red-900/40'}\`}
                  >
                    呼叫特警支援 ({MAX_RIOT_POLICE_CALLS - gameState.riotPoliceCallsUsed} 次剩余)
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-in slide-in-from-right duration-300">
               <h2 className="text-xs font-black text-neutral-600 uppercase tracking-widest mb-4 border-b border-neutral-800 pb-2">24小时日程设置</h2>
               <div className="grid grid-cols-4 gap-2">
                 {gameState.regime.map((activity, hour) => (
                   <button 
                     key={hour}
                     onClick={() => toggleRegimeHour(hour)}
                     className={\`flex flex-col items-center justify-center p-2 rounded-sm border border-neutral-800 transition-all hover:scale-105 \${ACTIVITY_COLORS[activity]}\`}
                   >
                     <span className="text-[10px] font-black opacity-60 leading-none">{hour}:00</span>
                     <span className="text-[9px] font-bold text-white">{ACTIVITY_LABELS[activity]}</span>
                   </button>
                 ))}
               </div>
            </div>
          )}

          <div className="mt-auto border-t border-neutral-800 pt-6">
            <div className="bg-neutral-900/50 p-4 rounded border border-neutral-800 space-y-3">
               <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">监狱主理人手册</h3>
               <ul className="text-[10px] text-neutral-500 space-y-2 leading-relaxed list-disc pl-4">
                 <li>囚犯刑满后需要玩家手动在“行政事务”中点击释放。</li>
                 <li>确保设施充足，医疗升级可提升囚犯整体健康。</li>
               </ul>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-neutral-900 relative flex items-center justify-center p-8 overflow-auto">
          <GameEngine 
            selectedTool={selectedTool} 
            money={gameState.money}
            onStateChange={handleStateChange}
            onCountsChange={handleCountsChange}
            isRiotActive={gameState.isRiotActive}
            regime={gameState.regime}
            releaseTrigger={gameState.releaseTrigger}
          />
          
          {gameState.isRiotActive && (
            <div className="absolute top-12 left-1/2 -translate-x-1/2 pointer-events-none z-20">
               <div className="bg-red-700 text-white px-12 py-3 font-black italic text-3xl animate-bounce shadow-[0_0_50px_rgba(185,28,28,0.5)] border-y-4 border-white">
                  警报：发生大规模暴乱
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatBox: React.FC<{ label: string, value: string | number, color: string }> = ({ label, value, color }) => (
  <div className="flex flex-col">
    <span className="text-[10px] font-black text-neutral-600 uppercase tracking-widest mb-1">{label}</span>
    <span className={\`text-xl font-black tracking-tight leading-none \${color}\`}>{value}</span>
  </div>
);

const ToolButton: React.FC<{ active: boolean, onClick: () => void, label: string, cost?: number, color?: string, fullWidth?: boolean }> = ({ active, onClick, label, cost, color, fullWidth }) => (
  <button 
    onClick={onClick}
    className={\`py-3 px-2 text-xs font-black rounded-sm border transition-all uppercase tracking-widest flex flex-col items-center justify-center gap-1
      \${active ? 'bg-white text-black border-white shadow-lg scale-[1.02]' : (color || 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-600')}
      \${fullWidth ? 'w-full' : ''}\`}
  >
    <span>{label}</span>
    {cost && <span className={\`text-[9px] opacity-70\`}>￥{cost}</span>}
  </button>
);

export default App;
`,

  'components/GameEngine.tsx': `
import React, { useRef, useEffect, useCallback } from 'react';
import { TileType, Vector2, Prisoner, Police, GridCell, PrisonerLevel, GameState, RegimeActivity, GameEvent } from '../types';
import { GRID_SIZE, MAP_WIDTH, MAP_HEIGHT, TILE_COLORS, PRISONER_LEVEL_COLORS, COSTS, INCOME, MAX_POLICE, MAX_DEATHS, MAX_RIOTS, MAX_RIOT_POLICE_CALLS } from '../constants';

interface Effect {
  id: string;
  pos: Vector2;
  text: string;
  color: string;
  life: number;
}

interface Particle {
  id: string;
  pos: Vector2;
  vel: Vector2;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

interface GameEngineProps {
  selectedTool: TileType | 'POLICE' | 'PATROL' | 'RIOT_CONTROL' | 'DELETE';
  money: number;
  onStateChange: (state: Partial<GameState>) => void;
  onCountsChange: (counts: { police: number, prisoners: number }) => void;
  isRiotActive: boolean;
  regime: RegimeActivity[];
  releaseTrigger?: number; // External signal to process releases
}

const ACTIVITY_TILE_MAP: Record<RegimeActivity, TileType | null> = {
  SLEEP: TileType.BED,
  EAT: TileType.KITCHEN,
  YARD: TileType.YARD,
  SHOWER: TileType.SHOWER,
  FREE: null
};

const ACTIVITY_LABELS: Record<RegimeActivity, string> = {
  SLEEP: '就寝时间',
  EAT: '用餐时间',
  YARD: '放风时间',
  SHOWER: '洗浴时间',
  FREE: '自由活动'
};

const GameEngine: React.FC<GameEngineProps> = ({ selectedTool, money, onStateChange, onCountsChange, isRiotActive, regime, releaseTrigger }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridRef = useRef<GridCell[][]>(Array.from({ length: MAP_HEIGHT }, () => Array.from({ length: MAP_WIDTH }, () => ({ type: TileType.FLOOR }))));
  const prisonersRef = useRef<Prisoner[]>([]);
  const policeRef = useRef<Police[]>([]);
  const effectsRef = useRef<Effect[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  
  const moneyRef = useRef(money);
  const timeRef = useRef(0);
  const lastTickRef = useRef(0);
  const coverageMapRef = useRef<boolean[][]>(Array.from({ length: MAP_HEIGHT }, () => Array.from({ length: MAP_WIDTH }, () => false)));
  
  const deathCountRef = useRef(0);
  const escapedCountRef = useRef(0);
  const releasedCountRef = useRef(0);
  const riotProbRef = useRef(0);
  const riotOccurrenceRef = useRef(0);
  const riotPoliceCallsUsedRef = useRef(0);
  const isRiotActiveRef = useRef(isRiotActive);
  const regimeRef = useRef(regime);
  const lastReleaseTriggerRef = useRef(releaseTrigger || 0);

  useEffect(() => { moneyRef.current = money; }, [money]);
  useEffect(() => { isRiotActiveRef.current = isRiotActive; }, [isRiotActive]);
  useEffect(() => { regimeRef.current = regime; }, [regime]);

  useEffect(() => {
    const grid = gridRef.current;
    for (let x = 0; x < MAP_WIDTH; x++) {
      grid[0][x].type = TileType.WALL;
      grid[MAP_HEIGHT - 1][x].type = TileType.WALL;
    }
    for (let y = 0; y < MAP_HEIGHT; y++) {
      grid[y][0].type = TileType.WALL;
      grid[y][MAP_WIDTH - 1].type = TileType.WALL;
    }
    grid[Math.floor(MAP_HEIGHT / 2)][0].type = TileType.DOOR;
  }, []);

  // Handle external manual release command
  useEffect(() => {
    if (releaseTrigger !== undefined && releaseTrigger > lastReleaseTriggerRef.current) {
      lastReleaseTriggerRef.current = releaseTrigger;
      let count = 0;
      prisonersRef.current.forEach(p => {
        if (p.isReadyForRelease && !p.isReleased) {
          p.isReleased = true;
          p.isReadyForRelease = false;
          p.isEscaping = false;
          p.speed *= 1.5; // Walk faster to the exit
          const gx = Math.floor(p.pos.x / GRID_SIZE);
          const gy = Math.floor(p.pos.y / GRID_SIZE);
          p.path = findPathBFS(gx, gy, 0, Math.floor(MAP_HEIGHT / 2)) || [];
          
          addEffect(p.pos, "办结！自由！", "#fbbf24");
          spawnParticles(p.pos, 30, "#fbbf24");
          clearBedOccupant(p.id);
          count++;
        }
      });
      if (count > 0) {
        addEffect({x: MAP_WIDTH * GRID_SIZE / 2, y: 100}, \`成功释放 \${count} 名囚犯\`, "#4ade80");
      }
    }
  }, [releaseTrigger]);

  const findPathBFS = (startGx: number, startGy: number, targetGx: number, targetGy: number): Vector2[] | undefined => {
    if (startGx === targetGx && startGy === targetGy) return [];
    const queue: { x: number, y: number, path: Vector2[] }[] = [{ x: startGx, y: startGy, path: [] }];
    const visited = new Set<string>();
    visited.add(\`\${startGx},\${startGy}\`);
    const directions = [{ x: 0, y: 1 }, { x: 0, y: -1 }, { x: 1, y: 0 }, { x: -1, y: 0 }];
    while (queue.length > 0) {
      const current = queue.shift()!;
      for (const dir of directions) {
        const nx = current.x + dir.x; const ny = current.y + dir.y;
        const key = \`\${nx},\${ny}\`;
        if (nx >= 0 && nx < MAP_WIDTH && ny >= 0 && ny < MAP_HEIGHT && !visited.has(key) && 
            (gridRef.current[ny][nx].type !== TileType.WALL || (nx === targetGx && ny === targetGy))) {
          const newPath = [...current.path, { x: (nx + 0.5) * GRID_SIZE, y: (ny + 0.5) * GRID_SIZE }];
          if (nx === targetGx && ny === targetGy) return newPath;
          visited.add(key);
          queue.push({ x: nx, y: ny, path: newPath });
        }
      }
      if (queue.length > 1500) break;
    }
    return undefined;
  };

  const addEffect = (pos: Vector2, text: string, color: string) => {
    effectsRef.current.push({
      id: Math.random().toString(),
      pos: { ...pos },
      text,
      color,
      life: 60
    });
  };

  const spawnParticles = (pos: Vector2, count: number, color: string) => {
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        id: Math.random().toString(),
        pos: { ...pos },
        vel: { x: (Math.random() - 0.5) * 4, y: (Math.random() - 0.5) * 4 - 2 },
        life: 30 + Math.random() * 30,
        maxLife: 60,
        size: 2 + Math.random() * 4,
        color
      });
    }
  };

  const spawnPrisoner = (level: PrisonerLevel) => {
    const sentences = { 1: 30, 2: 60, 3: 120 };
    const p: Prisoner = {
      id: Math.random().toString(36).substring(2, 11),
      pos: { x: 1.5 * GRID_SIZE, y: (Math.floor(MAP_HEIGHT / 2) + 0.5) * GRID_SIZE },
      level,
      isEscaping: false,
      isRioting: false,
      isReleased: false,
      isReadyForRelease: false,
      isBeingEscorted: false,
      hasCell: false,
      sentence: sentences[level as keyof typeof sentences],
      health: 100,
      speed: 0.7 + Math.random() * 0.3,
      hunger: 0,
      sleep: 0,
      social: 0,
      currentTask: 'IDLE',
      path: []
    };
    prisonersRef.current.push(p);
  };

  const findNearestTile = (startGx: number, startGy: number, type: TileType): {gx: number, gy: number} | undefined => {
    let nearest: {gx: number, gy: number} | undefined;
    let minDist = Infinity;
    for (let y = 0; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        if (gridRef.current[y][x].type === type) {
          const d = Math.abs(x - startGx) + Math.abs(y - startGy);
          if (d < minDist) { minDist = d; nearest = { gx: x, gy: y }; }
        }
      }
    }
    return nearest;
  };

  const findAvailableBed = (startGx: number, startGy: number): {gx: number, gy: number} | undefined => {
    let nearest: {gx: number, gy: number} | undefined;
    let minDist = Infinity;
    for (let y = 0; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        const cell = gridRef.current[y][x];
        if (cell.type === TileType.BED && !cell.occupantId) {
          const d = Math.abs(x - startGx) + Math.abs(y - startGy);
          if (d < minDist) { minDist = d; nearest = { gx: x, gy: y }; }
        }
      }
    }
    return nearest;
  };

  const findPrisonerBed = (prisonerId: string): {gx: number, gy: number} | undefined => {
    for (let y = 0; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        if (gridRef.current[y][x].occupantId === prisonerId) {
          return { gx: x, gy: y };
        }
      }
    }
    return undefined;
  };

  const clearBedOccupant = (prisonerId: string) => {
    for (let y = 0; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        if (gridRef.current[y][x].occupantId === prisonerId) {
          gridRef.current[y][x].occupantId = undefined;
        }
      }
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.floor((e.clientX - rect.left) / GRID_SIZE);
    const y = Math.floor((e.clientY - rect.top) / GRID_SIZE);
    if (x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT) return;

    if (selectedTool === 'POLICE') {
      if (moneyRef.current >= COSTS.POLICE && policeRef.current.filter(p => !p.isRiotPolice).length < MAX_POLICE) {
        moneyRef.current -= COSTS.POLICE;
        onStateChange({ money: moneyRef.current });
        const spawnPos = { x: (x + 0.5) * GRID_SIZE, y: (y + 0.5) * GRID_SIZE };
        policeRef.current.push({
          id: Math.random().toString(36).substring(2, 11),
          pos: { ...spawnPos },
          homePos: { ...spawnPos },
          speed: 1.5,
          patrolRoute: [{ ...spawnPos }],
          currentRouteIndex: 0,
          isRiotPolice: false,
          isEscorting: false
        });
      }
    } else if (selectedTool === 'PATROL') {
      const lastPolice = [...policeRef.current].reverse().find(p => !p.isRiotPolice);
      if (lastPolice) lastPolice.patrolRoute.push({ x: (x + 0.5) * GRID_SIZE, y: (y + 0.5) * GRID_SIZE });
    } else if (selectedTool === 'RIOT_CONTROL') {
      if (isRiotActiveRef.current && riotPoliceCallsUsedRef.current < MAX_RIOT_POLICE_CALLS) {
        riotPoliceCallsUsedRef.current += 1;
        onStateChange({ riotPoliceCallsUsed: riotPoliceCallsUsedRef.current });
        for (let i = 0; i < 4; i++) {
          const spawnPos = { x: 1.5 * GRID_SIZE, y: (Math.floor(MAP_HEIGHT / 2) + 0.5 + (i - 1.5)) * GRID_SIZE };
          policeRef.current.push({
            id: 'riot-' + Math.random(),
            pos: { ...spawnPos },
            homePos: { ...spawnPos },
            speed: 2.5,
            patrolRoute: [],
            currentRouteIndex: 0,
            isRiotPolice: true,
            isEscorting: false
          });
        }
      }
    } else if (selectedTool === 'DELETE') {
      const cell = gridRef.current[y][x];
      if (cell.type === TileType.BED && cell.occupantId) {
        const p = prisonersRef.current.find(pr => pr.id === cell.occupantId);
        if (p) p.hasCell = false;
      }
      if (cell.type !== TileType.FLOOR) cell.type = TileType.FLOOR;
      cell.occupantId = undefined;
    } else {
      const type = selectedTool as TileType;
      const cost = COSTS[type as keyof typeof COSTS] || 0;
      if (moneyRef.current >= cost && gridRef.current[y][x].type !== type) {
        gridRef.current[y][x].type = type;
        moneyRef.current -= cost;
        onStateChange({ money: moneyRef.current });
      }
    }
  };

  const triggerRandomEvent = () => {
    const events: GameEvent[] = [
      {
        id: 'lunch_special',
        title: '午餐特餐',
        description: '后勤部门为囚犯准备了丰盛的午餐特餐，囚犯们感到非常满意。暴乱风险大幅下降。',
        type: 'POSITIVE'
      },
      {
        id: 'dangerous_inmate',
        title: '危险囚犯挑战',
        description: '一名极度危险的重刑犯被押送入狱。监管压力骤增，暴乱风险提高。',
        type: 'NEGATIVE'
      },
      {
        id: 'medical_upgrade',
        title: '医务室升级',
        description: '通过政府拨款，监狱医务室得到了全面升级。所有囚犯的健康状况得到了显著改善。',
        type: 'POSITIVE'
      }
    ];

    const selectedEvent = events[Math.floor(Math.random() * events.length)];
    
    // Apply effects
    if (selectedEvent.id === 'lunch_special') {
      riotProbRef.current = Math.max(0, riotProbRef.current - 25);
      moneyRef.current = Math.max(0, moneyRef.current - 500);
    } else if (selectedEvent.id === 'dangerous_inmate') {
      spawnPrisoner(PrisonerLevel.LEVEL_3);
      riotProbRef.current += 15;
    } else if (selectedEvent.id === 'medical_upgrade') {
      prisonersRef.current.forEach(p => p.health = Math.min(100, p.health + 30));
      moneyRef.current = Math.max(0, moneyRef.current - 1000);
    }

    onStateChange({ activeEvent: selectedEvent, money: moneyRef.current, riotProbability: Math.floor(riotProbRef.current) });
  };

  const updatePatrolCoverage = () => {
    const cov = Array.from({ length: MAP_HEIGHT }, () => Array.from({ length: MAP_WIDTH }, () => false));
    policeRef.current.forEach(p => {
      const gx = Math.floor(p.pos.x / GRID_SIZE);
      const gy = Math.floor(p.pos.y / GRID_SIZE);
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          const nx = gx + dx; const ny = gy + dy;
          if (nx >= 0 && nx < MAP_WIDTH && ny >= 0 && ny < MAP_HEIGHT) cov[ny][nx] = true;
        }
      }
    });
    coverageMapRef.current = cov;
  };

  const updatePhysics = () => {
    updatePatrolCoverage();
    
    effectsRef.current.forEach(e => { e.life--; e.pos.y -= 0.5; });
    effectsRef.current = effectsRef.current.filter(e => e.life > 0);

    particlesRef.current.forEach(p => {
      p.pos.x += p.vel.x; p.pos.y += p.vel.y;
      p.vel.y += 0.05; p.life--;
    });
    particlesRef.current = particlesRef.current.filter(p => p.life > 0);

    const hour = Math.floor((timeRef.current % 1440) / 60);
    const currentActivity = regimeRef.current[hour];
    const targetTileType = ACTIVITY_TILE_MAP[currentActivity];

    policeRef.current.forEach(p => {
      const isEmergency = isRiotActiveRef.current || prisonersRef.current.some(pr => pr.isEscaping);
      const effectiveSpeed = p.speed * (isEmergency ? 1.6 : 1.0);

      if (p.isEscorting && p.escortTargetId) {
        const prisoner = prisonersRef.current.find(pr => pr.id === p.escortTargetId);
        if (prisoner && p.targetPos) {
          const dx = p.targetPos.x - p.pos.x;
          const dy = p.targetPos.y - p.pos.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 10) {
            p.isEscorting = false; p.escortTargetId = undefined; p.targetPos = undefined;
            prisoner.isBeingEscorted = false;
            if (p.destinationTile === TileType.BED) prisoner.hasCell = true;
            addEffect(prisoner.pos, "押送完成", "#4ade80");
          } else {
            p.pos.x += (dx / dist) * effectiveSpeed;
            p.pos.y += (dy / dist) * effectiveSpeed;
            prisoner.pos.x = p.pos.x - (dx / dist) * 12;
            prisoner.pos.y = p.pos.y - (dy / dist) * 12;
          }
        } else {
          p.isEscorting = false; p.escortTargetId = undefined;
        }
        return;
      }

      if (!p.isRiotPolice && !p.isEscorting) {
        const needsCell = prisonersRef.current.find(pr => !pr.hasCell && !pr.isBeingEscorted && !pr.isReleased);
        if (needsCell) {
          const bed = findAvailableBed(Math.floor(needsCell.pos.x / GRID_SIZE), Math.floor(needsCell.pos.y / GRID_SIZE));
          if (bed) {
            gridRef.current[bed.gy][bed.gx].occupantId = needsCell.id;
            p.isEscorting = true; p.escortTargetId = needsCell.id; p.destinationTile = TileType.BED;
            p.targetPos = { x: (bed.gx + 0.5) * GRID_SIZE, y: (bed.gy + 0.5) * GRID_SIZE };
            needsCell.isBeingEscorted = true;
            addEffect(p.pos, "分配床位", "#fde047");
            return;
          }
        }

        if (targetTileType) {
          const outOfPlace = prisonersRef.current.find(pr => 
            !pr.isBeingEscorted && !pr.isRioting && !pr.isEscaping && !pr.isReleased && !pr.isReadyForRelease &&
            gridRef.current[Math.floor(pr.pos.y / GRID_SIZE)][Math.floor(pr.pos.x / GRID_SIZE)].type !== targetTileType
          );
          
          if (outOfPlace) {
            let targetCoords: {gx: number, gy: number} | undefined;
            if (targetTileType === TileType.BED) {
              targetCoords = findPrisonerBed(outOfPlace.id);
            } else {
              targetCoords = findNearestTile(Math.floor(outOfPlace.pos.x / GRID_SIZE), Math.floor(outOfPlace.pos.y / GRID_SIZE), targetTileType);
            }

            if (targetCoords) {
              p.isEscorting = true; p.escortTargetId = outOfPlace.id; p.destinationTile = targetTileType;
              p.targetPos = { x: (targetCoords.gx + 0.5) * GRID_SIZE, y: (targetCoords.gy + 0.5) * GRID_SIZE };
              outOfPlace.isBeingEscorted = true;
              addEffect(p.pos, \`执行日程: \${ACTIVITY_LABELS[currentActivity]}\`, "#fde047");
              return;
            }
          }
        }
      }

      let moveTarget = p.isRiotPolice ? (prisonersRef.current.find(pr => pr.isRioting || pr.isEscaping)?.pos || p.homePos) : null;
      if (!moveTarget) {
        if (p.patrolRoute && p.patrolRoute.length > 0) {
          moveTarget = p.patrolRoute[p.currentRouteIndex];
        } else if (p.homePos) {
          moveTarget = p.homePos;
        }
      }

      if (moveTarget) {
        const dx = moveTarget.x - p.pos.x;
        const dy = moveTarget.y - p.pos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 2) {
          if (dist < 5 && p.patrolRoute && p.patrolRoute.length > 0 && !p.isRiotPolice) {
            p.currentRouteIndex = (p.currentRouteIndex + 1) % p.patrolRoute.length;
          } else {
            p.pos.x += (dx / dist) * effectiveSpeed;
            p.pos.y += (dy / dist) * effectiveSpeed;
          }
        }
      }
    });

    prisonersRef.current = prisonersRef.current.filter(p => {
      if (p.health <= 0) {
        deathCountRef.current += 1;
        onStateChange({ deathCount: deathCountRef.current });
        clearBedOccupant(p.id);
        if (deathCountRef.current >= MAX_DEATHS) onStateChange({ isGameOver: true, gameOverReason: "囚犯死亡人数过多，社会名誉扫地。" });
        return false;
      }

      const gx = Math.floor(p.pos.x / GRID_SIZE);
      const gy = Math.floor(p.pos.y / GRID_SIZE);
      const isPatrolled = coverageMapRef.current[gy]?.[gx];
      
      if (isPatrolled) { 
        if (p.isEscaping) {
          addEffect(p.pos, "被拦截!", "#f87171");
          p.isEscaping = false; p.path = [];
        }
        p.isRioting = false; 
      }

      if (p.isBeingEscorted) return true;

      if (p.sentence <= 0 && !p.isReleased && !p.isReadyForRelease && !p.isRioting) {
        p.isReadyForRelease = true;
        addEffect(p.pos, "等待释放申请", "#fbbf24");
      }

      if (p.isReadyForRelease) {
        p.pos.x += (Math.random() - 0.5) * 0.2;
        p.pos.y += (Math.random() - 0.5) * 0.2;
        return true;
      }

      const needFactor = (p.hunger + p.sleep + p.social) / 300;
      const escapeChance = 0.0002 + (riotProbRef.current / 20000) + (needFactor / 5000);
      
      if (!isPatrolled && !p.isRioting && !p.isEscaping && !p.isReleased && Math.random() < escapeChance) {
        p.isEscaping = true;
        p.path = findPathBFS(gx, gy, 0, Math.floor(MAP_HEIGHT / 2)) || [];
        addEffect(p.pos, "计划逃跑...", "#ffffff");
      }

      if (p.isReleased && Math.random() < 0.2) spawnParticles(p.pos, 1, "#fbbf24"); 

      if (p.path && p.path.length > 0) {
        const nextNode = p.path[0];
        const dx = nextNode.x - p.pos.x;
        const dy = nextNode.y - p.pos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 4) { p.path.shift(); } 
        else { 
          const pSpeed = p.isEscaping ? p.speed * 0.9 : p.speed;
          p.pos.x += (dx / dist) * pSpeed; 
          p.pos.y += (dy / dist) * pSpeed; 
        }
      } else if (p.isRioting) {
        p.pos.x += (Math.random() - 0.5) * 4; p.pos.y += (Math.random() - 0.5) * 4;
      } else {
        p.pos.x += (Math.random() - 0.5) * 0.4; p.pos.y += (Math.random() - 0.5) * 0.4;
      }

      if ((p.isEscaping || p.isReleased) && p.pos.x < 15) {
        if (p.isEscaping) {
           escapedCountRef.current += 1;
           onStateChange({ escapedCount: escapedCountRef.current });
           clearBedOccupant(p.id);
           if (escapedCountRef.current >= 10) onStateChange({ isGameOver: true, gameOverReason: "越狱人数过多，您被剥夺了管理权。" });
        } else {
           releasedCountRef.current += 1;
           moneyRef.current += 1500;
           onStateChange({ releasedCount: releasedCountRef.current, money: moneyRef.current });
           spawnParticles(p.pos, 20, "#fbbf24"); 
        }
        return false; 
      }
      return true;
    });

    if (isRiotActiveRef.current && prisonersRef.current.filter(p => p.isRioting).length === 0) {
      isRiotActiveRef.current = false;
      onStateChange({ isRiotActive: false });
      policeRef.current = policeRef.current.filter(p => !p.isRiotPolice);
    }
  };

  const drawTileDetails = (ctx: CanvasRenderingContext2D, type: TileType, x: number, y: number) => {
    const px = x * GRID_SIZE; const py = y * GRID_SIZE;
    ctx.fillStyle = TILE_COLORS[type];
    ctx.fillRect(px, py, GRID_SIZE, GRID_SIZE);
    switch(type) {
      case TileType.WALL:
        ctx.fillStyle = '#111827'; ctx.fillRect(px, py, GRID_SIZE, GRID_SIZE);
        ctx.strokeStyle = '#333'; ctx.strokeRect(px, py, GRID_SIZE, GRID_SIZE);
        break;
      case TileType.DOOR:
        ctx.fillStyle = '#451a03'; ctx.fillRect(px + 8, py, 16, GRID_SIZE);
        ctx.strokeStyle = '#9ca3af'; ctx.strokeRect(px + 10, py, 12, GRID_SIZE);
        break;
      case TileType.BED:
        ctx.fillStyle = '#1e3a8a'; ctx.fillRect(px + 4, py + 4, GRID_SIZE - 8, GRID_SIZE - 8);
        ctx.fillStyle = '#ffffff'; ctx.fillRect(px + 8, py + 6, GRID_SIZE - 16, 6);
        if (gridRef.current[y][x].occupantId) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.setLineDash([2, 2]);
          ctx.strokeRect(px + 2, py + 2, GRID_SIZE - 4, GRID_SIZE - 4);
          ctx.setLineDash([]);
        }
        break;
      case TileType.KITCHEN:
        ctx.fillStyle = '#92400e'; ctx.fillRect(px + 2, py + 2, GRID_SIZE - 4, GRID_SIZE - 4);
        break;
      case TileType.YARD:
        ctx.fillStyle = '#065f46'; ctx.fillRect(px, py, GRID_SIZE, GRID_SIZE);
        break;
    }
  };

  const drawPrisoner = (ctx: CanvasRenderingContext2D, p: Prisoner) => {
    ctx.save(); ctx.translate(p.pos.x, p.pos.y);
    const bodyColor = p.isReleased ? "#fbbf24" : PRISONER_LEVEL_COLORS[p.level as keyof typeof PRISONER_LEVEL_COLORS];
    if (p.isReleased) {
      ctx.fillStyle = 'rgba(251, 191, 36, 0.3)'; ctx.beginPath(); ctx.arc(0, 0, 20, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = bodyColor; ctx.fillRect(-8, -6, 16, 14);
    ctx.fillStyle = '#fde68a'; ctx.beginPath(); ctx.arc(0, -8, 6, 0, Math.PI * 2); ctx.fill();
    
    if (p.isReadyForRelease) {
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(-6, -24, 12, 12);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.strokeRect(-6, -24, 12, 12);
      ctx.beginPath();
      ctx.moveTo(-3, -18); ctx.lineTo(3, -18);
      ctx.moveTo(-3, -15); ctx.lineTo(3, -15);
      ctx.stroke();
    }

    if (p.isRioting || p.isEscaping) {
      ctx.strokeStyle = p.isRioting ? '#ef4444' : '#ffffff'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, -4, 12, 0, Math.PI * 2); ctx.stroke();
    }
    if (p.isBeingEscorted) {
       ctx.fillStyle = '#fde047'; ctx.font = 'bold 8px Arial'; ctx.textAlign = 'center';
       ctx.fillText("押送中", 0, 22);
    } else if (p.sentence > 0 && !p.isReleased && !p.isReadyForRelease) {
       ctx.fillStyle = 'white'; ctx.font = '8px Arial'; ctx.textAlign = 'center';
       ctx.fillText(\`\${p.sentence}m\`, 0, 18);
    } else if (p.isReadyForRelease) {
       ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 8px Arial'; ctx.textAlign = 'center';
       ctx.fillText("等待申请", 0, 22);
    }
    ctx.restore();
  };

  const drawPolice = (ctx: CanvasRenderingContext2D, p: Police) => {
    ctx.save(); ctx.translate(p.pos.x, p.pos.y);
    if (p.isRiotPolice) {
      ctx.fillStyle = '#0f172a'; ctx.fillRect(-10, -8, 20, 18);
      ctx.fillStyle = '#1e293b'; ctx.beginPath(); ctx.arc(0, -10, 7, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.fillStyle = '#1e3a8a'; ctx.fillRect(-8, -6, 16, 16);
      ctx.fillStyle = '#fde68a'; ctx.beginPath(); ctx.arc(0, -8, 6, 0, Math.PI * 2); ctx.fill();
    }
    if (p.isEscorting && p.targetPos) {
       ctx.restore(); ctx.save(); ctx.strokeStyle = 'rgba(253, 224, 71, 0.4)';
       ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(p.pos.x, p.pos.y); ctx.lineTo(p.targetPos.x, p.targetPos.y); ctx.stroke();
    }
    ctx.restore();
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        drawTileDetails(ctx, gridRef.current[y][x].type, x, y);
      }
    }
    particlesRef.current.forEach(p => {
      ctx.globalAlpha = p.life / p.maxLife; ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.pos.x, p.pos.y, p.size, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1.0;
    prisonersRef.current.forEach(p => drawPrisoner(ctx, p));
    policeRef.current.forEach(p => drawPolice(ctx, p));
    effectsRef.current.forEach(e => {
      ctx.fillStyle = e.color; ctx.font = 'bold 12px Arial'; ctx.textAlign = 'center';
      ctx.globalAlpha = e.life / 60; ctx.fillText(e.text, e.pos.x, e.pos.y - 15); ctx.globalAlpha = 1.0;
    });
  }, []);

  const gameLoop = useCallback((timestamp: number) => {
    if (timestamp - lastTickRef.current > 1000) {
      timeRef.current += 1; lastTickRef.current = timestamp;
      const hour = Math.floor((timeRef.current % 1440) / 60);
      const activity = regimeRef.current[hour];

      if (timeRef.current % 60 === 0 && Math.random() < 0.25) {
        triggerRandomEvent();
      }

      if (timeRef.current % 20 === 0) {
        const waitingAtDoor = prisonersRef.current.filter(p => !p.hasCell && p.pos.x < 100).length;
        if (waitingAtDoor < 4) {
           const r = Math.random();
           spawnPrisoner(r > 0.9 ? PrisonerLevel.LEVEL_3 : r > 0.7 ? PrisonerLevel.LEVEL_2 : PrisonerLevel.LEVEL_1);
        }
      }

      if (timeRef.current % 30 === 0) {
        let totalIncome = 0;
        prisonersRef.current.forEach(p => {
          totalIncome += INCOME[p.level as keyof typeof INCOME];
        });
        moneyRef.current += totalIncome; 
        onStateChange({ money: moneyRef.current });
      }
      
      prisonersRef.current.forEach(p => {
        p.hunger = Math.min(100, p.hunger + 0.2); p.sleep = Math.min(100, p.sleep + 0.2); p.social = Math.min(100, p.social + 0.1);
        if (p.sentence > 0 && !p.isReleased && !p.isRioting) p.sentence--;
      });

      const count = prisonersRef.current.length;
      const beds = gridRef.current.flat().filter(t => t.type === TileType.BED).length;
      if (beds < count) riotProbRef.current = Math.min(100, riotProbRef.current + 1.2);
      else riotProbRef.current = Math.max(0, riotProbRef.current - 0.5);
      
      if (!isRiotActiveRef.current && riotProbRef.current > 50 && Math.random() < (riotProbRef.current / 500)) {
        riotOccurrenceRef.current += 1; isRiotActiveRef.current = true;
        onStateChange({ isRiotActive: true, riotOccurrenceCount: riotOccurrenceRef.current });
        prisonersRef.current.forEach(p => { if (Math.random() < 0.5) p.isRioting = true; });
        if (riotOccurrenceRef.current >= MAX_RIOTS) onStateChange({ isGameOver: true, gameOverReason: "大规模暴乱彻底失控。" });
      }

      onStateChange({ 
        time: timeRef.current, riotProbability: Math.floor(riotProbRef.current), 
        currentRegime: ACTIVITY_LABELS[activity],
        readyToReleaseCount: prisonersRef.current.filter(p => p.isReadyForRelease).length
      });
      onCountsChange({ 
        police: policeRef.current.filter(p => !p.isRiotPolice).length, prisoners: prisonersRef.current.length 
      });
    }
    updatePhysics(); draw(); requestAnimationFrame(gameLoop);
  }, [draw, onCountsChange, onStateChange]);

  useEffect(() => { const frame = requestAnimationFrame(gameLoop); return () => cancelAnimationFrame(frame); }, [gameLoop]);

  return <canvas ref={canvasRef} width={MAP_WIDTH * GRID_SIZE} height={MAP_HEIGHT * GRID_SIZE} onClick={handleCanvasClick} className="pixel-border shadow-2xl cursor-crosshair rounded-sm bg-neutral-800" />;
};

export default GameEngine;
`,

  'types.ts': `
export enum TileType {
  FLOOR = 'FLOOR',
  WALL = 'WALL',
  BED = 'BED',
  TOILET = 'TOILET',
  SHOWER = 'SHOWER',
  KITCHEN = 'KITCHEN',
  YARD = 'YARD',
  DOOR = 'DOOR'
}

export type RegimeActivity = 'SLEEP' | 'EAT' | 'YARD' | 'SHOWER' | 'FREE';

export enum PrisonerLevel {
  LEVEL_1 = 1, // Normal
  LEVEL_2 = 2, // Heavy
  LEVEL_3 = 3  // Dangerous
}

export interface Vector2 {
  x: number;
  y: number;
}

export interface Entity {
  id: string;
  pos: Vector2;
  targetPos?: Vector2;
  speed: number;
}

export interface Prisoner extends Entity {
  level: PrisonerLevel;
  isEscaping: boolean;
  isRioting: boolean;
  isReleased: boolean;
  isReadyForRelease: boolean; // 新增：刑期已满，等待玩家点击释放
  isBeingEscorted: boolean;
  hasCell: boolean;
  sentence: number;
  health: number;
  hunger: number;
  sleep: number;
  social: number;
  currentTask?: 'EATING' | 'SLEEPING' | 'SOCIALIZING' | 'SHOWERING' | 'IDLE';
  path?: Vector2[]; 
}

export interface Police extends Entity {
  patrolRoute: Vector2[];
  currentRouteIndex: number;
  isRiotPolice: boolean;
  isEscorting: boolean;
  escortTargetId?: string;
  destinationTile?: TileType;
  homePos?: Vector2;
}

export interface GridCell {
  type: TileType;
  roomId?: string;
  occupantId?: string;
}

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  type: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
}

export interface GameState {
  money: number;
  time: number;
  riotProbability: number;
  deathCount: number;
  escapedCount: number; 
  releasedCount: number;
  riotOccurrenceCount: number;
  isRiotActive: boolean;
  riotPoliceCallsUsed: number;
  isGameOver: boolean;
  gameOverReason: string;
  currentRegime: string;
  regime: RegimeActivity[];
  activeEvent?: GameEvent | null;
  releaseTrigger?: number; // 用于从外部触发释放逻辑
  readyToReleaseCount?: number; // 传回UI显示的待释放人数
}
`,

  'constants.ts': `
export const GRID_SIZE = 32;
export const MAP_WIDTH = 25;
export const MAP_HEIGHT = 18;

export const TILE_COLORS = {
  FLOOR: '#374151',   // Darker concrete
  WALL: '#111827',    // Deep slate
  BED: '#1e40af',     // Navy blue frame
  TOILET: '#f3f4f6',  // Off-white porcelain
  SHOWER: '#0ea5e9',  // Sky blue
  KITCHEN: '#92400e', // Rusty orange/brown
  YARD: '#065f46',    // Deep grass green
  DOOR: '#451a03'     // Heavy wood/metal brown
};

export const PRISONER_LEVEL_COLORS = {
  1: '#86efac', // Light Green
  2: '#fde047', // Yellow
  3: '#ef4444'  // Red
};

export const COSTS = {
  WALL: 50,
  BED: 100,
  TOILET: 150,
  SHOWER: 200,
  KITCHEN: 500,
  YARD: 300,
  POLICE: 800, // Slightly cheaper to encourage hiring early
  REPAIR: 20,
  DOOR: 100
};

export const INCOME = {
  1: 15, // Increased daily income
  2: 30,
  3: 60
};

export const GAME_TICK_RATE = 1000;
export const MAX_POLICE = 12; // Increased cap
export const MAX_RIOT_POLICE_CALLS = 2;
export const MAX_DEATHS = 10;
export const MAX_RIOTS = 3;
`
};
