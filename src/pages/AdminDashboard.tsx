import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Grid,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  SelectChangeEvent,
  LinearProgress,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Engineering as EngineeringIcon,
  AdminPanelSettings,
  TrendingUp,
  CalendarToday,
  Warning as WarningIcon,
  Group as GroupIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { User, UserRole } from '../types';
import * as userService from '../services/userService';
import { useNotification } from '../contexts/NotificationContext';
import NotificationContainer from '../components/NotificationContainer';

const AdminDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: UserRole.CLIENT,
  });
  const [error, setError] = useState('');
  const [filterRole, setFilterRole] = useState<UserRole | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

  // Statistiques
  const stats = {
    totalUsers: users.length,
    clients: users.filter(u => u.role === UserRole.CLIENT).length,
    professionals: users.filter(u => u.role === UserRole.PROFESSIONAL).length,
    businesses: users.filter(u => u.role === UserRole.BUSINESS).length,
    activeUsers: users.filter(u => u.isActive).length,
    inactiveUsers: users.filter(u => !u.isActive).length,
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await userService.getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      setError('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      role: UserRole.CLIENT,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRoleChange = (e: SelectChangeEvent<UserRole>) => {
    setFormData(prev => ({
      ...prev,
      role: e.target.value as UserRole,
    }));
  };

  const handleSubmit = async () => {
    try {
      if (selectedUser) {
        await userService.updateUser(selectedUser.id, formData);
        await loadUsers();
        handleCloseDialog();
        showNotification('Utilisateur modifié avec succès', 'success');
      }
    } catch (error) {
      setError('Erreur lors de la mise à jour de l\'utilisateur');
      showNotification('Erreur lors de la mise à jour de l\'utilisateur', 'error');
    }
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setUserToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (userToDelete) {
      try {
        await userService.deleteUser(userToDelete.id);
        await loadUsers();
        handleCloseDeleteDialog();
        showNotification('Utilisateur supprimé avec succès', 'success');
      } catch (error) {
        setError('Erreur lors de la suppression de l\'utilisateur');
        showNotification('Erreur lors de la suppression de l\'utilisateur', 'error');
      }
    }
  };

  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      console.log('Tentative de modification du statut de connexion:', { userId, currentStatus: isActive, newStatus: !isActive });
      await userService.updateUserStatus(userId, !isActive);
      console.log('Statut de connexion modifié avec succès');
      await loadUsers();
      showNotification(`Compte ${!isActive ? 'activé' : 'désactivé'} avec succès`, 'success');
    } catch (error: any) {
      console.error('Erreur détaillée:', error);
      setError(`Erreur lors de la modification du statut de connexion: ${error.message || 'Erreur inconnue'}`);
      showNotification('Erreur lors de la modification du statut du compte', 'error');
    }
  };

  const filteredUsers = filterRole
    ? users.filter(user => user.role === filterRole)
    : users;

  const StatCard = ({ title, value, icon, color }: { title: string; value: number; icon: React.ReactNode; color: string }) => (
    <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '100px',
          height: '100%',
          opacity: 0.1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </Box>
      <CardContent>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h4" component="div" sx={{ color }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
          Tableau de bord administrateur
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Gérez les utilisateurs et surveillez l'activité de la plateforme
        </Typography>
      </Box>

      {loading && <LinearProgress sx={{ mb: 4 }} />}

      {/* Statistiques */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Total Utilisateurs"
            value={stats.totalUsers}
            icon={<GroupIcon sx={{ fontSize: 60 }} />}
            color="primary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Clients"
            value={stats.clients}
            icon={<PersonIcon sx={{ fontSize: 60 }} />}
            color="info.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Professionnels"
            value={stats.professionals}
            icon={<EngineeringIcon sx={{ fontSize: 60 }} />}
            color="warning.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Entreprises"
            value={stats.businesses}
            icon={<BusinessIcon sx={{ fontSize: 60 }} />}
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Utilisateurs Actifs"
            value={stats.activeUsers}
            icon={<CheckCircleIcon sx={{ fontSize: 60 }} />}
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Utilisateurs Inactifs"
            value={stats.inactiveUsers}
            icon={<BlockIcon sx={{ fontSize: 60 }} />}
            color="error.main"
          />
        </Grid>
      </Grid>

      {/* Filtres et recherche */}
      <Paper sx={{ mb: 4, p: 3, borderRadius: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Rechercher un utilisateur"
              variant="outlined"
              size="small"
              placeholder="Nom, email..."
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Filtrer par rôle</InputLabel>
              <Select
                value={filterRole || ''}
                label="Filtrer par rôle"
                onChange={(e) => setFilterRole(e.target.value ? e.target.value as UserRole : undefined)}
              >
                <MenuItem value="">Tous les rôles</MenuItem>
                <MenuItem value={UserRole.CLIENT}>Clients</MenuItem>
                <MenuItem value={UserRole.PROFESSIONAL}>Professionnels</MenuItem>
                <MenuItem value={UserRole.BUSINESS}>Entreprises</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Liste des utilisateurs */}
      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Utilisateur</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Rôle</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {user.firstName[0]}{user.lastName[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2">
                        {user.firstName} {user.lastName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {user.id}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmailIcon fontSize="small" color="action" />
                    {user.email}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    icon={
                      user.role === UserRole.CLIENT ? <PersonIcon /> :
                      user.role === UserRole.PROFESSIONAL ? <EngineeringIcon /> :
                      <BusinessIcon />
                    }
                    label={user.role}
                    color={
                      user.role === UserRole.CLIENT ? 'primary' :
                      user.role === UserRole.PROFESSIONAL ? 'warning' :
                      'success'
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.isActive ? 'Compte actif' : 'Compte désactivé'}
                    color={user.isActive ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Modifier">
                    <IconButton onClick={() => handleEditUser(user)} color="primary">
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Supprimer">
                    <IconButton onClick={() => handleDeleteClick(user)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={user.isActive ? "Désactiver le compte" : "Activer le compte"}>
                    <IconButton 
                      onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                      color={user.isActive ? "warning" : "success"}
                    >
                      {user.isActive ? <BlockIcon /> : <CheckCircleIcon />}
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog de modification */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Prénom"
              fullWidth
              value={formData.firstName}
              onChange={handleInputChange}
              name="firstName"
            />
            <TextField
              label="Nom"
              fullWidth
              value={formData.lastName}
              onChange={handleInputChange}
              name="lastName"
            />
            <TextField
              label="Email"
              fullWidth
              value={formData.email}
              onChange={handleInputChange}
              name="email"
              disabled
            />
            <FormControl fullWidth>
              <InputLabel>Rôle</InputLabel>
              <Select
                value={formData.role}
                label="Rôle"
                onChange={handleRoleChange}
              >
                <MenuItem value={UserRole.CLIENT}>Client</MenuItem>
                <MenuItem value={UserRole.PROFESSIONAL}>Professionnel</MenuItem>
                <MenuItem value={UserRole.BUSINESS}>Entreprise</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de confirmation de suppression */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
          <WarningIcon color="error" />
          Confirmer la suppression
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mt: 2 }}>
            Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{userToDelete?.firstName} {userToDelete?.lastName}</strong> ?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            Cette action est irréversible et supprimera définitivement le compte de l'utilisateur.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Annuler</Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      <NotificationContainer />
    </Container>
  );
};

export default AdminDashboard; 