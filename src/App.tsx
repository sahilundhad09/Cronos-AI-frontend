import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import MainLayout from './components/layout/MainLayout';
import { useAuthStore } from './store/useAuthStore';

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
    return (
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
                            <div className="p-10 text-center">
                                <h2 className="text-4xl font-heading font-black text-white italic uppercase">Project <span className="text-cyan-400">Hub</span></h2>
                                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-4">Module coming soon // Synchronizing data...</p>
                            </div>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/team"
                    element={
                        <ProtectedRoute>
                            <div className="p-10 text-center">
                                <h2 className="text-4xl font-heading font-black text-white italic uppercase">Team <span className="text-cyan-400">Nexus</span></h2>
                                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-4">Module coming soon // Synchronizing data...</p>
                            </div>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/ai-chat"
                    element={
                        <ProtectedRoute>
                            <div className="p-10 text-center">
                                <h2 className="text-4xl font-heading font-black text-white italic uppercase">Neural <span className="text-cyan-400">Engine</span></h2>
                                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-4">Module coming soon // Synchronizing data...</p>
                            </div>
                        </ProtectedRoute>
                    }
                />

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
