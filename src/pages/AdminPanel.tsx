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
  TablePagination,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { UserRole } from '../types';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

const AdminPanel = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<UserRole | 'ALL'>('ALL');

  // Simuler le chargement des utilisateurs
  useEffect(() => {
    // TODO: Remplacer par un appel API réel
    const mockUsers: User[] = [
      {
        id: '1',
        email: 'user1@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.CLIENT,
        isActive: true,
        createdAt: '2024-01-01',
        lastLogin: '2024-04-08',
      },
      {
        id: '2',
        email: 'user2@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        role: UserRole.PROFESSIONAL,
        isActive: true,
        createdAt: '2024-02-15',
        lastLogin: '2024-04-07',
      },
      // Ajouter plus d'utilisateurs de test si nécessaire
    ];
    setUsers(mockUsers);
  }, []);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setOpenDialog(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        // TODO: Implémenter la suppression d'utilisateur
        console.log('Suppression de l\'utilisateur:', userId);
      } catch (error) {
        setError('Erreur lors de la suppression de l\'utilisateur');
      }
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      // TODO: Implémenter le changement de statut
      console.log('Changement de statut pour l\'utilisateur:', userId, !currentStatus);
    } catch (error) {
      setError('Erreur lors du changement de statut');
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
    setError('');
  };

  const handleSubmit = async () => {
    if (!selectedUser) return;

    try {
      // TODO: Implémenter la mise à jour de l'utilisateur
      console.log('Mise à jour de l\'utilisateur:', selectedUser);
      handleCloseDialog();
    } catch (error) {
      setError('Erreur lors de la mise à jour de l\'utilisateur');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'ALL' || user.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  if (user?.role !== UserRole.ADMIN) {
    return (
      <Container maxWidth="xl" sx={{ pt: 4, px: { xs: 2, sm: 3, md: 4 } }}>
        <Alert severity="error">
          Accès non autorisé. Vous devez être administrateur pour accéder à cette page.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ pt: 4, px: { xs: 2, sm: 3, md: 4 } }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
          Administration des utilisateurs
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Gérez les comptes utilisateurs et leurs permissions
        </Typography>
      </Box>

      {/* Filtres et recherche */}
      <Paper sx={{ mb: 4, p: 3, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Rechercher"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ minWidth: 200 }}
          />
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Rôle</InputLabel>
            <Select<UserRole | 'ALL'>
              value={filterRole}
              label="Rôle"
              onChange={(e) => setFilterRole(e.target.value as UserRole | 'ALL')}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="ALL">Tous les rôles</MenuItem>
              <MenuItem value={UserRole.CLIENT}>Client</MenuItem>
              <MenuItem value={UserRole.PROFESSIONAL}>Professionnel</MenuItem>
              <MenuItem value={UserRole.BUSINESS}>Entreprise</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Table des utilisateurs */}
      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nom</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Rôle</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Date d'inscription</TableCell>
                <TableCell>Dernière connexion</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.role}
                        color={
                          user.role === UserRole.ADMIN
                            ? 'error'
                            : user.role === UserRole.PROFESSIONAL
                            ? 'primary'
                            : user.role === UserRole.BUSINESS
                            ? 'secondary'
                            : 'default'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.isActive ? 'Actif' : 'Inactif'}
                        color={user.isActive ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleDateString()
                        : 'Jamais'}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleEditUser(user)}
                        sx={{ color: 'primary.main' }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                        sx={{ color: user.isActive ? 'error.main' : 'success.main' }}
                      >
                        {user.isActive ? <BlockIcon /> : <CheckCircleIcon />}
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteUser(user.id)}
                        sx={{ color: 'error.main' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

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
              label="Email"
              fullWidth
              value={selectedUser?.email || ''}
              disabled
            />
            <TextField
              label="Prénom"
              fullWidth
              value={selectedUser?.firstName || ''}
              disabled
            />
            <TextField
              label="Nom"
              fullWidth
              value={selectedUser?.lastName || ''}
              disabled
            />
            <FormControl fullWidth>
              <InputLabel>Rôle</InputLabel>
              <Select
                value={selectedUser?.role || UserRole.CLIENT}
                label="Rôle"
                onChange={(e) =>
                  setSelectedUser(
                    prev =>
                      prev
                        ? { ...prev, role: e.target.value as UserRole }
                        : null
                  )
                }
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
          <Button onClick={handleSubmit} variant="contained">
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminPanel; 