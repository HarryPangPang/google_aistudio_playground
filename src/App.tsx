import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Playground from './pages/studio';
import { MainLayout } from './layout/MainLayout';
import { RobotMarket } from './pages/market/RobotMarket';
import { GameMarket } from './pages/market/GameMarket';
import Rank from './pages/rank';
import { Projects } from './pages/projects';
import { Earnings } from './pages/earnings';
import './index.scss';

export default function App() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Playground />} />
        <Route path="/create" element={<Navigate to="/" replace />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/earnings" element={<Earnings />} />
        <Route path="/robot-market" element={<RobotMarket />} />
        <Route path="/game-market" element={<GameMarket />} />
        <Route path="/ranking" element={<Rank />} />
      </Routes>
    </MainLayout>
  );
}
