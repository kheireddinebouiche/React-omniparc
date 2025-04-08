import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Chip,
  IconButton,
  Alert,
  MenuItem,
  Grid,
  Rating,
  Tooltip,
  Badge,
  Divider,
  FormControl,
  InputLabel,
  Select,
  Stack,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Euro as EuroIcon,
  Category as CategoryIcon,
  TrendingUp as TrendingUpIcon,
  Inventory as InventoryIcon,
  CheckCircle as CheckCircleIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { RootState } from '../store';
import { UserRole, Equipment } from '../types/index';
import { addEquipment, updateEquipment, setEquipment } from '../store/slices/equipmentSlice';
import * as equipmentService from '../services/equipmentService';
import { useNotification } from '../contexts/NotificationContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const equipment = useSelector((state: RootState) => state.equipment.items);
  const loading = useSelector((state: RootState) => state.equipment.loading);
  const error = useSelector((state: RootState) => state.equipment.error);
  const { showNotification } = useNotification();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    specifications: {} as Record<string, string>,
  });
  const [specificationFields, setSpecificationFields] = useState<string[]>(['poids', 'puissance', 'capacité']);
  const [sortBy, setSortBy] = useState('name');
  const [filterCategory, setFilterCategory] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  // Calcul des statistiques
  const stats = {
    totalEquipment: equipment.length,
    availableEquipment: equipment.filter(e => e.isAvailable).length,
    totalValue: equipment.reduce((sum, e) => sum + e.price, 0),
    averagePrice: equipment.length > 0 
      ? Math.round(equipment.reduce((sum, e) => sum + e.price, 0) / equipment.length) 
      : 0
  };

  // Catégories prédéfinies
  const categories = [
    { value: 'excavation', label: 'Excavation' },
    { value: 'transport', label: 'Transport' },
    { value: 'construction', label: 'Construction' },
    { value: 'manutention', label: 'Manutention' },
    { value: 'compactage', label: 'Compactage' },
    { value: 'nettoyage', label: 'Nettoyage' },
    { value: 'forage', label: 'Forage' },
    { value: 'autres', label: 'Autres' },
  ];

  // Champs de spécifications disponibles
  const availableSpecFields = [
    { key: 'poids', label: 'Poids' },
    { key: 'hauteur', label: 'Hauteur' },
    { key: 'largeur', label: 'Largeur' },
    { key: 'longueur', label: 'Longueur' },
    { key: 'puissance', label: 'Puissance' },
    { key: 'capacité', label: 'Capacité' },
    { key: 'année', label: 'Année' },
    { key: 'marque', label: 'Marque' },
    { key: 'modèle', label: 'Modèle' },
    { key: 'carburant', label: 'Carburant' },
    { key: 'heures', label: 'Heures d\'utilisation' },
  ];

  // Charger les engins de l'utilisateur
  React.useEffect(() => {
    const loadUserEquipment = async () => {
      if (user?.id) {
        try {
          const userEquipment = await equipmentService.getEquipmentsByOwner(user.id);
          dispatch(setEquipment(userEquipment));
        } catch (error) {
          console.error('Erreur lors du chargement des engins:', error);
          setLocalError('Erreur lors du chargement de vos engins');
        }
      }
    };

    loadUserEquipment();
  }, [user?.id, dispatch]);

  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleAddEquipment = () => {
    setSelectedEquipment(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      image: '',
      specifications: {},
    });
    setSpecificationFields(['poids', 'puissance', 'capacité']);
    setLocalError('');
    setOpenDialog(true);
  };

  const handleEditEquipment = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setFormData({
      name: equipment.name,
      description: equipment.description,
      price: equipment.price.toString(),
      category: equipment.category,
      image: (equipment as Equipment & { image?: string }).image || '',
      specifications: equipment.specifications || {},
    });
    
    // Définir les champs de spécifications à afficher
    const specKeys = Object.keys(equipment.specifications || {});
    setSpecificationFields(specKeys.length > 0 ? specKeys : ['poids', 'puissance', 'capacité']);
    
    setLocalError('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setLocalError('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name && name.startsWith('spec_')) {
      const specName = name.replace('spec_', '');
      setFormData(prev => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [specName]: value as string,
        },
      }));
    } else if (name) {
      setFormData(prev => ({
        ...prev,
        [name]: value as string,
      }));
    }
  };

  const handleAddSpecField = (fieldKey: string) => {
    if (!specificationFields.includes(fieldKey)) {
      setSpecificationFields([...specificationFields, fieldKey]);
    }
  };

  const handleRemoveSpecField = (fieldKey: string) => {
    setSpecificationFields(specificationFields.filter(field => field !== fieldKey));
  };

  const handleSubmit = async () => {
    try {
      // Vérification du rôle de l'utilisateur
      if (user?.role !== UserRole.PROFESSIONAL && user?.role !== UserRole.BUSINESS) {
        setLocalError('Vous n\'avez pas les permissions nécessaires pour ajouter un engin');
        return;
      }

      // Validation des champs obligatoires
      if (!formData.name || !formData.description || !formData.price || !formData.category) {
        setLocalError('Veuillez remplir tous les champs obligatoires');
        return;
      }

      // Validation du prix
      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        setLocalError('Le prix doit être un nombre positif');
        return;
      }

      // Filtrer les spécifications vides
      const filteredSpecs: Record<string, string> = {};
      Object.entries(formData.specifications).forEach(([key, value]) => {
        if (value && value.trim() !== '') {
          filteredSpecs[key] = value;
        }
      });

      const equipmentData = {
        name: formData.name,
        description: formData.description,
        price: price,
        category: formData.category,
        specifications: filteredSpecs,
        ownerId: user?.id || '',
        isAvailable: true,
        image: formData.image || 'https://via.placeholder.com/300x200',
      };

      console.log('Données de l\'équipement à sauvegarder:', equipmentData);

      if (selectedEquipment) {
        await equipmentService.updateEquipment(selectedEquipment.id, equipmentData);
        dispatch(updateEquipment({ ...equipmentData, id: selectedEquipment.id }));
      } else {
        const newEquipment = await equipmentService.addEquipment(equipmentData);
        dispatch(addEquipment(newEquipment));
      }

      handleCloseDialog();
    } catch (error: any) {
      console.error('Erreur détaillée:', error);
      setLocalError(`Une erreur est survenue lors de l'enregistrement de l'engin: ${error.message}`);
    }
  };

  const handleDeleteEquipment = async (equipmentId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet engin ?')) {
      try {
        // TODO: Implement delete equipment
        console.log('Delete equipment:', equipmentId);
      } catch (error) {
        setLocalError('Une erreur est survenue lors de la suppression de l\'engin');
      }
    }
  };

  if (!user) return null;

  return (
    <Container maxWidth="xl" sx={{ pt: 4, px: { xs: 2, sm: 3, md: 4 } }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
          Tableau de bord
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Gérez vos engins et suivez vos statistiques
        </Typography>
      </Box>

      {/* Statistiques */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: 'primary.light',
              color: 'primary.contrastText',
              borderRadius: 3,
              transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: (theme) => theme.shadows[8],
              },
            }}
          >
            <InventoryIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.totalEquipment}</Typography>
            <Typography variant="body2">Total des engins</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: 'success.light',
              color: 'success.contrastText',
              borderRadius: 3,
              transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: (theme) => theme.shadows[8],
              },
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.availableEquipment}</Typography>
            <Typography variant="body2">Engins disponibles</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: 'info.light',
              color: 'info.contrastText',
              borderRadius: 3,
              transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: (theme) => theme.shadows[8],
              },
            }}
          >
            <EuroIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.totalValue.toLocaleString()}€</Typography>
            <Typography variant="body2">Valeur totale</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: 'warning.light',
              color: 'warning.contrastText',
              borderRadius: 3,
              transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: (theme) => theme.shadows[8],
              },
            }}
          >
            <TrendingUpIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.averagePrice.toLocaleString()}€</Typography>
            <Typography variant="body2">Prix moyen/jour</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Filtres et tri */}
      <Paper 
        elevation={2} 
        sx={{ 
          mb: 4, 
          p: 3, 
          borderRadius: 3,
          display: 'flex', 
          gap: 2, 
          alignItems: 'center',
          flexWrap: 'wrap',
          bgcolor: 'background.paper',
        }}
      >
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Catégorie</InputLabel>
          <Select
            value={filterCategory}
            label="Catégorie"
            onChange={(e) => setFilterCategory(e.target.value)}
            sx={{ borderRadius: 2 }}
          >
            <MenuItem value="">Toutes</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat.value} value={cat.value}>
                {cat.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Trier par</InputLabel>
          <Select
            value={sortBy}
            label="Trier par"
            onChange={(e) => setSortBy(e.target.value)}
            sx={{ borderRadius: 2 }}
          >
            <MenuItem value="name">Nom</MenuItem>
            <MenuItem value="price">Prix</MenuItem>
            <MenuItem value="category">Catégorie</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddEquipment}
          sx={{ 
            ml: 'auto',
            borderRadius: 2,
            px: 3,
            py: 1,
            fontWeight: 600,
            boxShadow: 3,
            '&:hover': {
              boxShadow: 6,
            }
          }}
        >
          Ajouter un engin
        </Button>
      </Paper>

      {/* Liste des engins */}
      <Grid container spacing={3}>
        {equipment
          .filter(e => !filterCategory || e.category === filterCategory)
          .sort((a, b) => {
            switch (sortBy) {
              case 'price':
                return b.price - a.price;
              case 'category':
                return a.category.localeCompare(b.category);
              default:
                return a.name.localeCompare(b.name);
            }
          })
          .map((item) => (
            <Grid item key={item.id} xs={12} sm={6} md={4}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: (theme) => theme.shadows[8],
                  },
                  borderRadius: 3,
                  overflow: 'hidden',
                  boxShadow: 3,
                  maxWidth: 300,
                  mx: 'auto',
                }}
              >
                <Box sx={{ position: 'relative', height: 150, width: '100%' }}>
                  <CardMedia
                    component="img"
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                    image={item.image || 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'}
                    alt={item.name}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      zIndex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      backdropFilter: 'blur(8px)',
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      borderRadius: 3,
                      px: 2,
                      py: 1,
                      boxShadow: 2,
                    }}
                  >
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: item.isAvailable ? 'success.main' : 'error.main',
                        boxShadow: `0 0 8px ${item.isAvailable ? 'success.main' : 'error.main'}`,
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: item.isAvailable ? 'success.dark' : 'error.dark',
                        textTransform: 'uppercase',
                        letterSpacing: 1,
                        fontSize: '0.75rem',
                      }}
                    >
                      {item.isAvailable ? 'Disponible' : 'Non disponible'}
                    </Typography>
                  </Box>
                </Box>
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" component="h2" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                      {item.name}
                    </Typography>
                  </Box>
                  <Typography color="text.secondary" gutterBottom sx={{ mb: 2, fontSize: '0.9rem' }}>
                    {item.description}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                    <Chip
                      icon={<CategoryIcon />}
                      label={categories.find(c => c.value === item.category)?.label || item.category}
                      size="small"
                      sx={{ borderRadius: 2 }}
                    />
                    <Chip
                      icon={<EuroIcon />}
                      label={`${item.price}€/jour`}
                      size="small"
                      sx={{ borderRadius: 2 }}
                    />
                  </Stack>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {Object.entries(item.specifications).slice(0, 3).map(([key, value]) => (
                      <Chip
                        key={key}
                        label={`${key}: ${value}`}
                        size="small"
                        variant="outlined"
                        sx={{ borderRadius: 2 }}
                      />
                    ))}
                  </Box>
                </CardContent>
                <CardActions sx={{ 
                  p: 2, 
                  pt: 0,
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 1
                }}>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => handleEditEquipment(item)}
                    sx={{ 
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 500,
                      px: 2,
                      py: 1,
                      bgcolor: 'primary.light',
                      color: 'primary.contrastText',
                      '&:hover': {
                        bgcolor: 'primary.main',
                        transform: 'translateY(-2px)',
                        boxShadow: 2
                      },
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                    Modifier
                  </Button>
                  <Button
                    size="small"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDeleteEquipment(item.id)}
                    sx={{ 
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 500,
                      px: 2,
                      py: 1,
                      bgcolor: 'error.light',
                      color: 'error.contrastText',
                      '&:hover': {
                        bgcolor: 'error.main',
                        transform: 'translateY(-2px)',
                        boxShadow: 2
                      },
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                    Supprimer
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
      </Grid>

      {/* Dialog pour ajouter/modifier un engin */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedEquipment ? 'Modifier l\'engin' : 'Ajouter un engin'}
        </DialogTitle>
        <DialogContent>
          {localError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {localError}
            </Alert>
          )}
          <Box sx={{ flexGrow: 1, mt: 1 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <TextField
                  name="name"
                  label="Nom de l'engin"
                  fullWidth
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </Box>
              <Box>
                <TextField
                  name="description"
                  label="Description"
                  fullWidth
                  multiline
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <TextField
                    name="price"
                    label="Prix par jour (€)"
                    type="number"
                    fullWidth
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    InputProps={{
                      inputProps: { min: 0 }
                    }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <TextField
                    select
                    name="category"
                    label="Catégorie"
                    fullWidth
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    SelectProps={{
                      native: false,
                    }}
                  >
                    <MenuItem value="" disabled>
                      Sélectionnez une catégorie
                    </MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category.value} value={category.value}>
                        {category.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>
              </Box>
              <Box>
                <TextField
                  name="image"
                  label="URL de l'image"
                  fullWidth
                  value={formData.image}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                />
              </Box>
              
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6">Spécifications techniques</Typography>
                  <Button 
                    size="small" 
                    onClick={() => setOpenDialog(true)}
                    sx={{ display: 'none' }}
                  >
                    Ajouter un champ
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {availableSpecFields.map((field) => (
                    <Chip
                      key={field.key}
                      label={field.label}
                      onClick={() => handleAddSpecField(field.key)}
                      color={specificationFields.includes(field.key) ? 'primary' : 'default'}
                      variant={specificationFields.includes(field.key) ? 'filled' : 'outlined'}
                    />
                  ))}
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {specificationFields.map((fieldKey) => {
                    const field = availableSpecFields.find(f => f.key === fieldKey);
                    return (
                      <Box key={fieldKey} sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
                        <TextField
                          name={`spec_${fieldKey}`}
                          label={field?.label || fieldKey}
                          fullWidth
                          value={formData.specifications[fieldKey] || ''}
                          onChange={handleInputChange}
                          InputProps={{
                            endAdornment: (
                              <IconButton 
                                size="small" 
                                onClick={() => handleRemoveSpecField(fieldKey)}
                                sx={{ mr: -1 }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            ),
                          }}
                        />
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedEquipment ? 'Modifier' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Dashboard; 