import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { store, RootState, AppDispatch } from './store';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import EquipmentDetails from './pages/EquipmentDetails';
import EquipmentEdit from './pages/EquipmentEdit';
import EquipmentList from './pages/EquipmentList';
import Rentals from './pages/Rentals';
import { NotificationProvider } from './contexts/NotificationContext';
import NotificationContainer from './components/NotificationContainer';
import { getCurrentUser } from './store/slices/authSlice';
import { Spinner, Center } from '@chakra-ui/react';
import ProtectedRoute from './components/ProtectedRoute';
import { UserRole } from './types';
import UpdateRole from './pages/UpdateRole';
import AdminDashboard from './pages/AdminDashboard';
import ProfessionalDashboard from './pages/ProfessionalDashboard';
import MaintenanceManagement from './pages/MaintenanceManagement';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useSelector((state: RootState) => state.auth);
  
  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="blue.500" thickness="4px" />
      </Center>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
};

const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(getCurrentUser());
  }, [dispatch]);

  return (
    <NotificationProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/equipment" element={<EquipmentList />} />
        <Route path="/equipment/:id" element={<EquipmentDetails />} />
        <Route
          path="/my-equipment"
          element={
            <PrivateRoute>
              <EquipmentList />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/equipment/edit/:id"
          element={
            <PrivateRoute>
              <EquipmentEdit />
            </PrivateRoute>
          }
        />
        <Route
          path="/rentals"
          element={
            <PrivateRoute>
              <Rentals />
            </PrivateRoute>
          }
        />
        <Route
          path="/update-role"
          element={
            <PrivateRoute>
              <UpdateRole />
            </PrivateRoute>
          }
        />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/professional-dashboard" element={<ProfessionalDashboard />} />
        <Route
          path="/maintenance"
          element={
            <PrivateRoute>
              <MaintenanceManagement />
            </PrivateRoute>
          }
        />
      </Routes>
      <NotificationContainer />
    </NotificationProvider>
  );
};

export default App;
