import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Pagination,
  IconButton,
  useTheme,
  useMediaQuery,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  Category as CategoryIcon,
  Euro as EuroIcon,
  FilterList as FilterIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { RootState } from '../store';
import { EquipmentState, setEquipment } from '../store/slices/equipmentSlice';
import { getEquipments } from '../services/equipmentService';
import { SelectChangeEvent } from '@mui/material/Select';

const EquipmentList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: equipment, loading, error } = useSelector((state: RootState) => (state.equipment as EquipmentState));
  const { user } = useSelector((state: RootState) => state.auth);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  const [filters, setFilters] = useState({
    search: '',
    category: '',
    priceRange: '',
  });

  const [page, setPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const equipmentData = await getEquipments();
        dispatch(setEquipment(equipmentData));
      } catch (err) {
        console.error('Erreur lors du chargement des équipements:', err);
      }
    };

    fetchEquipment();
  }, [dispatch]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setPage(1);
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setPage(1);
  };

  const filteredEquipment = equipment.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(filters.search.toLowerCase());
    const matchesCategory = !filters.category || item.category === filters.category;
    const matchesPrice = !filters.priceRange || item.price <= parseInt(filters.priceRange);
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const paginatedEquipment = filteredEquipment.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Box
        sx={{
          width: sidebarOpen ? '25%' : 0,
          minWidth: sidebarOpen ? 300 : 0,
          maxWidth: sidebarOpen ? 400 : 0,
          flexShrink: 0,
          transition: theme.transitions.create(['width', 'min-width', 'max-width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Box
          sx={{
            position: 'sticky',
            top: 80,
            width: '100%',
            p: 3,
            backgroundColor: 'background.paper',
            borderRight: '1px solid',
            borderColor: 'divider',
            boxShadow: (theme) => theme.shadows[1],
            height: 'calc(100vh - 100px)',
            borderRadius: 2,
            mx: 1,
            overflowY: 'auto',
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(0,0,0,0.1)',
              borderRadius: '3px',
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FilterIcon color="primary" sx={{ fontSize: 24 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Filtres
              </Typography>
            </Box>
            {isMobile && (
              <IconButton onClick={toggleSidebar} size="small">
                <CloseIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
          <Divider sx={{ mb: 2 }} />
          <TextField
            size="medium"
            fullWidth
            label="Rechercher"
            name="search"
            value={filters.search}
            onChange={handleTextChange}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 24 }} />,
            }}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 1,
                '&:hover fieldset': {
                  borderColor: 'primary.main',
                },
              },
            }}
          />
          <FormControl fullWidth size="medium" sx={{ mb: 2 }}>
            <InputLabel>Catégorie</InputLabel>
            <Select
              name="category"
              value={filters.category}
              label="Catégorie"
              onChange={handleSelectChange}
              startAdornment={<CategoryIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 24 }} />}
              sx={{
                borderRadius: 1,
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main',
                },
              }}
            >
              <MenuItem value="">Toutes</MenuItem>
              <MenuItem value="excavation">Excavation</MenuItem>
              <MenuItem value="transport">Transport</MenuItem>
              <MenuItem value="construction">Construction</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth size="medium">
            <InputLabel>Prix maximum</InputLabel>
            <Select
              name="priceRange"
              value={filters.priceRange}
              label="Prix maximum"
              onChange={handleSelectChange}
              startAdornment={<EuroIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 24 }} />}
              sx={{
                borderRadius: 1,
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main',
                },
              }}
            >
              <MenuItem value="">Tous les prix</MenuItem>
              <MenuItem value="500">500€/jour</MenuItem>
              <MenuItem value="1000">1000€/jour</MenuItem>
              <MenuItem value="2000">2000€/jour</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: sidebarOpen ? '75%' : '100%',
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            Équipements disponibles
          </Typography>
          {isMobile && (
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={toggleSidebar}
            >
              Filtres
            </Button>
          )}
        </Box>

        {loading ? (
          <Typography>Chargement...</Typography>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <>
            <Grid container spacing={4}>
              {paginatedEquipment.map((item) => (
                <Grid item key={item.id} xs={12} sm={6} md={4} lg={3}>
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
                      borderRadius: 2,
                      overflow: 'hidden',
                    }}
                  >
                    <Box sx={{ position: 'relative', paddingTop: '75%' }}>
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
                        }}
                      >
                        <Chip
                          label={item.isAvailable ? 'Disponible' : 'Non disponible'}
                          color={item.isAvailable ? 'success' : 'error'}
                          sx={{
                            backdropFilter: 'blur(4px)',
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                          }}
                        />
                      </Box>
                    </Box>
                    <CardContent sx={{ flexGrow: 1, p: 2 }}>
                      <Typography
                        gutterBottom
                        variant="h6"
                        component="h2"
                        sx={{
                          fontWeight: 600,
                          mb: 1,
                          fontSize: '1rem',
                        }}
                      >
                        {item.name}
                      </Typography>
                      <Typography
                        color="text.secondary"
                        sx={{
                          mb: 2,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          fontSize: '0.875rem',
                        }}
                      >
                        {item.description}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Typography
                          variant="h6"
                          color="primary"
                          sx={{ fontWeight: 600, fontSize: '1.25rem' }}
                        >
                          {item.price}€
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ ml: 0.5, fontSize: '0.875rem' }}
                        >
                          /jour
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                        {item.specifications && Object.entries(item.specifications).slice(0, 3).map(([key, value]) => (
                          <Chip
                            key={key}
                            label={`${key}: ${value}`}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.75rem' }}
                          />
                        ))}
                      </Box>
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={() => navigate(`/equipment/${item.id}`)}
                        disabled={!item.isAvailable || item.ownerId === user?.id}
                        sx={{
                          borderRadius: 2,
                          textTransform: 'none',
                          py: 1,
                          fontWeight: 500,
                        }}
                      >
                        {item.ownerId === user?.id ? 'Votre engin' : 'Voir les détails'}
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
              <Pagination
                count={Math.ceil(filteredEquipment.length / itemsPerPage)}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default EquipmentList; 