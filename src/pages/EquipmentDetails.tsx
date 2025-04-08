import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Chip,
  Divider,
  Rating,
  Avatar,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
} from '@mui/material';
import {
  CalendarToday,
  Euro,
  Category,
  CheckCircle,
  Cancel,
  Person,
  Star,
  Share,
  Favorite,
  FavoriteBorder,
  LocationOn,
  Build,
  Speed,
  Scale,
  Height,
  Info,
} from '@mui/icons-material';
import { RootState } from '../store';
import { Equipment } from '../types';
import { createRentalRequest } from '../services/rentalService';
import { useNotification } from '../contexts/NotificationContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

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
      id={`equipment-tabpanel-${index}`}
      aria-labelledby={`equipment-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const EquipmentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const equipment = useSelector((state: RootState) =>
    state.equipment.items.find((item: Equipment) => item.id === id)
  );

  const [openDialog, setOpenDialog] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [reviews] = useState([
    { id: 1, user: 'Jean Dupont', rating: 5, comment: 'Excellent équipement, très performant.', date: '2023-05-15' },
    { id: 2, user: 'Marie Martin', rating: 4, comment: 'Bon état général, quelques rayures mais rien de grave.', date: '2023-04-22' },
    { id: 3, user: 'Pierre Durand', rating: 3, comment: 'Fonctionne bien mais un peu bruyant.', date: '2023-03-10' },
  ]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite);
    showNotification(
      !isFavorite ? 'Ajouté aux favoris' : 'Retiré des favoris',
      !isFavorite ? 'success' : 'info'
    );
  };

  const handleShare = () => {
    // Implémenter le partage
    showNotification('Lien copié dans le presse-papier', 'success');
  };

  const handleSubmit = async () => {
    if (!startDate || !endDate) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Vérifier que la date de fin est après la date de début
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (end <= start) {
        setError('La date de fin doit être postérieure à la date de début');
        return;
      }
      
      // Créer la demande de location
      await createRentalRequest({
        equipmentId: id!,
        userId: 'current-user-id', // À remplacer par l'ID de l'utilisateur connecté
        startDate,
        endDate,
        status: 'PENDING',
        message: message || undefined
      });
      
      showNotification('Demande de location envoyée avec succès', 'success');
      setOpenDialog(false);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de l\'envoi de la demande');
    } finally {
      setLoading(false);
    }
  };

  if (!equipment) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // Calculer la note moyenne
  const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ overflow: 'hidden', borderRadius: 2 }}>
        <Grid container>
          {/* Image principale */}
          <Grid item xs={12} md={6}>
            <Box sx={{ position: 'relative', height: '100%', minHeight: 400 }}>
              <CardMedia
                component="img"
                image={equipment.image || 'https://via.placeholder.com/600x400?text=Engin+de+chantier'}
                alt={equipment.name}
                sx={{ height: '100%', objectFit: 'cover' }}
              />
              <Box 
                sx={{ 
                  position: 'absolute', 
                  top: 16, 
                  right: 16, 
                  display: 'flex', 
                  gap: 1,
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  borderRadius: 2,
                  p: 1
                }}
              >
                <Tooltip title={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}>
                  <IconButton onClick={handleFavoriteToggle} color={isFavorite ? "error" : "default"}>
                    {isFavorite ? <Favorite /> : <FavoriteBorder />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Partager">
                  <IconButton onClick={handleShare}>
                    <Share />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Grid>

          {/* Informations principales */}
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                  {equipment.name}
                </Typography>
                <Chip 
                  label={equipment.isAvailable ? "Disponible" : "Indisponible"} 
                  color={equipment.isAvailable ? "success" : "error"}
                  icon={equipment.isAvailable ? <CheckCircle /> : <Cancel />}
                />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Rating value={averageRating} precision={0.5} readOnly />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  ({reviews.length} avis)
                </Typography>
              </Box>

              <Typography variant="h5" color="primary" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                <Euro sx={{ mr: 1 }} /> {equipment.price} € / jour
              </Typography>

              <Typography variant="body1" paragraph>
                {equipment.description}
              </Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                <Chip 
                  icon={<Category />} 
                  label={equipment.category} 
                  variant="outlined" 
                />
                <Chip 
                  icon={<LocationOn />} 
                  label="Paris, France" 
                  variant="outlined" 
                />
              </Box>

              <Button
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                onClick={() => setOpenDialog(true)}
                disabled={!equipment.isAvailable}
                startIcon={<CalendarToday />}
                sx={{ mb: 2 }}
              >
                {equipment.isAvailable ? "Réserver maintenant" : "Indisponible"}
              </Button>

              <Button
                variant="outlined"
                color="primary"
                size="large"
                fullWidth
                onClick={() => navigate(`/equipment/${id}/contact`)}
                startIcon={<Person />}
              >
                Contacter le propriétaire
              </Button>
            </Box>
          </Grid>
        </Grid>

        {/* Onglets d'information */}
        <Box sx={{ borderTop: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant={isMobile ? "fullWidth" : "standard"}
            centered={!isMobile}
            sx={{ bgcolor: 'background.paper' }}
          >
            <Tab label="Spécifications" icon={<Build />} iconPosition="start" />
            <Tab label="Avis" icon={<Star />} iconPosition="start" />
            <Tab label="Disponibilité" icon={<CalendarToday />} iconPosition="start" />
          </Tabs>
        </Box>

        {/* Contenu des onglets */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Speed sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6">Vitesse</Typography>
                  <Typography variant="body1">30 km/h</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Scale sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6">Poids</Typography>
                  <Typography variant="body1">12 tonnes</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Height sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6">Hauteur</Typography>
                  <Typography variant="body1">3.2 m</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Info sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6">Année</Typography>
                  <Typography variant="body1">2020</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Caractéristiques détaillées
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(equipment.specifications).map(([key, value]) => (
                <Grid item xs={12} sm={6} key={key}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, borderBottom: 1, borderColor: 'divider' }}>
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                      {key}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {value}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Avis clients
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h3" component="div" sx={{ mr: 2 }}>
                {averageRating.toFixed(1)}
              </Typography>
              <Box>
                <Rating value={averageRating} precision={0.5} readOnly />
                <Typography variant="body2" color="text.secondary">
                  Basé sur {reviews.length} avis
                </Typography>
              </Box>
            </Box>
          </Box>

          <List>
            {reviews.map((review) => (
              <React.Fragment key={review.id}>
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar alt={review.user} src={`https://i.pravatar.cc/150?u=${review.user}`} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography component="span" variant="subtitle1">
                          {review.user}
                        </Typography>
                        <Rating value={review.rating} readOnly size="small" />
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.primary">
                          {review.comment}
                        </Typography>
                        <Typography variant="caption" display="block" color="text.secondary">
                          {format(new Date(review.date), 'dd MMMM yyyy', { locale: fr })}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
              </React.Fragment>
            ))}
          </List>

          <Button variant="outlined" fullWidth sx={{ mt: 2 }}>
            Voir tous les avis
          </Button>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Calendrier de disponibilité
          </Typography>
          <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'background.default' }}>
            <Typography variant="body1" paragraph>
              Calendrier de disponibilité à implémenter
            </Typography>
            <Button variant="contained" startIcon={<CalendarToday />}>
              Voir le calendrier
            </Button>
          </Paper>
        </TabPanel>
      </Paper>

      {/* Dialog de réservation */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h5" component="div">
            Réserver {equipment.name}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            {equipment.price} € / jour
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Date de début"
                type="date"
                fullWidth
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Date de fin"
                type="date"
                fullWidth
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Message (optionnel)"
                multiline
                rows={4}
                fullWidth
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Précisez vos besoins ou questions..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)}>
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? "Envoi en cours..." : "Confirmer la réservation"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EquipmentDetails; 