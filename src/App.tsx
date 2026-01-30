import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Playground from './pages/studio';
import { MainLayout } from './layout/MainLayout';
import { RobotMarket } from './pages/market/RobotMarket';
import { GameMarket } from './pages/market/GameMarket';
import Rank from './pages/rank';
import { LayoutProvider } from './context/LayoutContext';
import { I18nProvider } from './context/I18nContext';
import { AuthProvider } from './context/AuthContext';
import { Projects } from './pages/projects';
import { Earnings } from './pages/earnings';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ProtectedRoute } from './components/ProtectedRoute';
import './index.scss';

export default function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <LayoutProvider>
          <Routes>
            {/* 公开路由 */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* 受保护的路由 */}
            <Route path="/" element={
              <ProtectedRoute>
                <MainLayout>
                  <Playground />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/create" element={<Navigate to="/" replace />} />
            <Route path="/projects" element={
              <ProtectedRoute>
                <MainLayout>
                  <Projects />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/earnings" element={
              <ProtectedRoute>
                <MainLayout>
                  <Earnings />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/robot-market" element={
              <ProtectedRoute>
                <MainLayout>
                  <RobotMarket />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/game-market" element={
              <ProtectedRoute>
                <MainLayout>
                  <GameMarket />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/ranking" element={
              <ProtectedRoute>
                <MainLayout>
                  <Rank />
                </MainLayout>
              </ProtectedRoute>
            } />
          </Routes>
        </LayoutProvider>
      </AuthProvider>
    </I18nProvider>
  );
}
