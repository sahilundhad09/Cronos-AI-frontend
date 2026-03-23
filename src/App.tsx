import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Toaster } from '@/components/ui/sonner';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import MainLayout from './components/layout/MainLayout';
import { useAuthStore } from './store/useAuthStore';

const queryClient = new QueryClient();

import TeamPage from './pages/TeamPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import { ProjectSettingsPage } from './pages/ProjectSettingsPage';
import { WorkspaceSettingsPage } from './pages/WorkspaceSettingsPage';
import ProfilePage from './pages/ProfilePage';
import AIChatPage from './pages/ai/AIChatPage';
import AnalyticsDashboardPage from './pages/reports/AnalyticsDashboardPage';
import { useThemeStore } from './store/useThemeStore';
import ThemeSelectorPage from './pages/ThemeSelectorPage';
import GrowthPage from './pages/GrowthPage';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <MainLayout>{children}</MainLayout>;
};

// Public Route Component (redirects to dashboard if already logged in)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};

function App() {
    const initializeTheme = useThemeStore((state) => state.initializeTheme);

    useEffect(() => {
        initializeTheme();
    }, [initializeTheme]);

    return (
        <QueryClientProvider client={queryClient}>
            <Toaster />
            <Router>
                <Routes>
                    {/* Public Landing Page */}
                    <Route path="/" element={<LandingPage />} />

                    {/* Auth Routes */}
                    <Route
                        path="/login"
                        element={
                            <PublicRoute>
                                <LoginPage />
                            </PublicRoute>
                        }
                    />
                    <Route
                        path="/register"
                        element={
                            <PublicRoute>
                                <RegisterPage />
                            </PublicRoute>
                        }
                    />

                    {/* Protected Dashboard Routes */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <DashboardPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Additional Placeholder Routes to catch Sidebar navigation */}
                    <Route
                        path="/projects"
                        element={
                            <ProtectedRoute>
                                <ProjectsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/projects/:projectId"
                        element={
                            <ProtectedRoute>
                                <ProjectDetailsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/projects/:projectId/settings"
                        element={
                            <ProtectedRoute>
                                <ProjectSettingsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/workspaces/:workspaceId/settings"
                        element={
                            <ProtectedRoute>
                                <WorkspaceSettingsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <ProfilePage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/team"
                        element={
                            <ProtectedRoute>
                                <TeamPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/ai-chat"
                        element={
                            <ProtectedRoute>
                                <AIChatPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/analytics"
                        element={
                            <ProtectedRoute>
                                <AnalyticsDashboardPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/growth"
                        element={
                            <ProtectedRoute>
                                <GrowthPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/theme-selector"
                        element={
                            <ProtectedRoute>
                                <ThemeSelectorPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Catch-all */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </QueryClientProvider>
    );
}

export default App;
