import { Routes, Route, Navigate } from 'react-router-dom';
import { ChakraProvider, CSSReset } from '@chakra-ui/react';
import { theme } from './theme';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from './store';
import { getCurrentUser, login, logout } from './store/slices/authSlice';
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
import { auth } from './config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './config/firebase';
import { serializeFirestoreData } from './utils/serialization';

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Vérifier l'état d'authentification au chargement de l'application
    dispatch(getCurrentUser());
    
    // Écouter les changements d'état d'authentification
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Récupérer les données utilisateur depuis Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            // S'assurer que le rôle est en majuscules
            const normalizedUserData = {
              ...userData,
              role: userData.role.toUpperCase() as UserRole
            };
            // Mettre à jour le store Redux avec les données utilisateur
            dispatch(login.fulfilled(normalizedUserData as User, '', { email: '', password: '' }));
          }
        } catch (error) {
          console.error("Erreur lors de la récupération des données utilisateur:", error);
        }
      } else {
        // Déconnecter l'utilisateur dans le store Redux
        dispatch(logout.fulfilled(undefined, ''));
      }
    });
    
    // Nettoyer l'écouteur lors du démontage du composant
    return () => unsubscribe();
  }, [dispatch]);

  return (
    <NotificationProvider>
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
    </NotificationProvider>
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
