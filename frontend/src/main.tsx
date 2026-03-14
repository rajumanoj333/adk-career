import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout';
import { RequireUser } from './components/RequireUser';
import { HomePage } from './pages/HomePage';
import { OnboardingPage } from './pages/OnboardingPage';
import { AssessmentPage } from './pages/AssessmentPage';
import { AnalysisPage } from './pages/AnalysisPage';
import { RoadmapPage } from './pages/RoadmapPage';
import { CollegesPage } from './pages/CollegesPage';
import { DashboardPage } from './pages/DashboardPage';
import { NotFoundPage } from './pages/NotFoundPage';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="onboarding" element={<OnboardingPage />} />
            <Route
              path="assessment"
              element={
                <RequireUser>
                  <AssessmentPage />
                </RequireUser>
              }
            />
            <Route
              path="analysis"
              element={
                <RequireUser>
                  <AnalysisPage />
                </RequireUser>
              }
            />
            <Route
              path="roadmap"
              element={
                <RequireUser>
                  <RoadmapPage />
                </RequireUser>
              }
            />
            <Route
              path="colleges"
              element={
                <RequireUser>
                  <CollegesPage />
                </RequireUser>
              }
            />
            <Route
              path="dashboard"
              element={
                <RequireUser>
                  <DashboardPage />
                </RequireUser>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  </React.StrictMode>,
);
