import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  Divider,
  SelectChangeEvent,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { RootState, AppDispatch } from '../store';
import { EquipmentState } from '../store/slices/equipmentSlice';
import { addEquipment, updateEquipment, deleteEquipment } from '../store/slices/equipmentSlice';
import { Equipment } from '../types';

const categories = [
  'Pelle mécanique',
  'Chargeuse',
  'Niveleuse',
  'Bulldozer',
  'Grue',
  'Camion-benne',
  'Compacteur',
  'Autre',
];

const EquipmentManagement = () => {
  const dispatch = useDispatch<AppDispatch>();
  const equipment = useSelector((state: RootState) => (state.equipment as EquipmentState).items);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Equipment>>({
    name: '',
    description: '',
    price: 0,
    category: '',
    specifications: {
      poids: '',
      hauteur: '',
      capacite: '',
      annee: '',
      moteur: '',
      puissance: '',
    },
  });

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }> | SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSpecificationChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [key]: value,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.id) {
      dispatch(updateEquipment(formData as Equipment));
    } else {
      dispatch(addEquipment(formData as Equipment));
    }
    handleClose();
  };

  const handleDelete = (id: string) => {
    dispatch(deleteEquipment(id));
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Gestion des équipements
            </Typography>
          </Box>
          <Box>
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpen}
              startIcon={<AddIcon />}
            >
              Ajouter un équipement
            </Button>
          </Box>
          <Box>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nom</TableCell>
                    <TableCell>Catégorie</TableCell>
                    <TableCell>Prix</TableCell>
                    <TableCell>Spécifications</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {equipment.map((item: Equipment) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{item.price} €/jour</TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          Poids: {item.specifications.poids}
                        </Typography>
                        <Typography variant="body2">
                          Hauteur: {item.specifications.hauteur}
                        </Typography>
                        <Typography variant="body2">
                          Capacité: {item.specifications.capacite}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleDelete(item.id)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
      </Box>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {formData.id ? 'Modifier l\'équipement' : 'Ajouter un équipement'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
                <TextField
                  fullWidth
                  label="Nom"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Box>
              <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
                <FormControl fullWidth required>
                  <InputLabel>Catégorie</InputLabel>
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    label="Catégorie"
                  >
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ width: '100%' }}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  multiline
                  rows={4}
                  required
                />
              </Box>
              <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
                <TextField
                  fullWidth
                  label="Prix par jour"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">€</InputAdornment>,
                  }}
                  required
                />
              </Box>
              <Box sx={{ width: '100%' }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Spécifications techniques
                </Typography>
              </Box>
              <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
                <TextField
                  fullWidth
                  label="Poids"
                  value={formData.specifications?.poids}
                  onChange={(e) => handleSpecificationChange('poids', e.target.value)}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">kg</InputAdornment>,
                  }}
                />
              </Box>
              <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
                <TextField
                  fullWidth
                  label="Hauteur"
                  value={formData.specifications?.hauteur}
                  onChange={(e) => handleSpecificationChange('hauteur', e.target.value)}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">m</InputAdornment>,
                  }}
                />
              </Box>
              <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
                <TextField
                  fullWidth
                  label="Capacité"
                  value={formData.specifications?.capacite}
                  onChange={(e) => handleSpecificationChange('capacite', e.target.value)}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">m³</InputAdornment>,
                  }}
                />
              </Box>
              <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
                <TextField
                  fullWidth
                  label="Année de fabrication"
                  value={formData.specifications?.annee}
                  onChange={(e) => handleSpecificationChange('annee', e.target.value)}
                />
              </Box>
              <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
                <TextField
                  fullWidth
                  label="Type de moteur"
                  value={formData.specifications?.moteur}
                  onChange={(e) => handleSpecificationChange('moteur', e.target.value)}
                />
              </Box>
              <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
                <TextField
                  fullWidth
                  label="Puissance"
                  value={formData.specifications?.puissance}
                  onChange={(e) => handleSpecificationChange('puissance', e.target.value)}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">ch</InputAdornment>,
                  }}
                />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Annuler</Button>
            <Button type="submit" variant="contained" color="primary">
              {formData.id ? 'Modifier' : 'Ajouter'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default EquipmentManagement; 