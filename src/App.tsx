import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from './store';
import { getCurrentUser } from './store/slices/authSlice';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import EquipmentList from './pages/EquipmentList';
import EquipmentDetails from './pages/EquipmentDetails';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import { UserRole, User } from './types';
import { NotificationProvider } from './contexts/NotificationContext';
import NotificationContainer from './components/NotificationContainer';

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Vérifier l'état d'authentification au chargement de l'application
    dispatch(getCurrentUser());
  }, [dispatch]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NotificationProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
            <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
            <Route path="/equipment" element={<EquipmentList />} />
            <Route path="/equipment/:id" element={<EquipmentDetails />} />
            <Route
              path="/dashboard"
              element={
                user ? (
                  user.role === UserRole.ADMIN ? (
                    <AdminDashboardWrapper user={user} />
                  ) : (
                    <DashboardWrapper user={user} />
                  )
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
          </Routes>
          <NotificationContainer />
        </Router>
      </NotificationProvider>
    </ThemeProvider>
  );
}

interface DashboardWrapperProps {
  user: User;
}

const AdminDashboardWrapper = ({ user }: DashboardWrapperProps) => {
  useEffect(() => {
    console.log('État de l\'utilisateur:', {
      user: user,
      role: user.role,
      isAdmin: user.role === UserRole.ADMIN
    });
  }, [user]);
  return <AdminDashboard />;
};

const DashboardWrapper = ({ user }: DashboardWrapperProps) => {
  useEffect(() => {
    console.log('État de l\'utilisateur:', {
      user: user,
      role: user.role,
      isAdmin: user.role === UserRole.ADMIN
    });
  }, [user]);
  return <Dashboard />;
};

export default App;
