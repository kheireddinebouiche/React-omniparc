import { Box, Typography, Button, Card, CardContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import ConstructionIcon from '@mui/icons-material/Construction';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const isAuthenticated = !!user;

  const features = [
    {
      icon: <ConstructionIcon sx={{ fontSize: 40 }} />,
      title: 'Large choix d\'engins',
      description: 'Des milliers d\'engins de chantier disponibles pour tous vos projets'
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      title: 'Location sécurisée',
      description: 'Paiements sécurisés et garanties pour une location en toute confiance'
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 40 }} />,
      title: 'Réservation rapide',
      description: 'Réservez vos engins en quelques clics et recevez une confirmation instantanée'
    },
    {
      icon: <SupportAgentIcon sx={{ fontSize: 40 }} />,
      title: 'Support 24/7',
      description: 'Une équipe à votre écoute pour vous accompagner dans vos locations'
    }
  ];

  return (
    <Box sx={{ width: '100vw', overflow: 'hidden' }}>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          position: 'relative',
          width: '100%',
          mx: 0,
          px: { xs: 2, sm: 4, md: 8 }
        }}
      >
        <Box sx={{ 
          maxWidth: 'lg', 
          mx: 'auto',
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          gap: 4, 
          alignItems: 'center' 
        }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h2" component="h1" gutterBottom>
              Location d'Engins de Chantier
            </Typography>
            <Typography variant="h5" paragraph>
              Trouvez l'équipement parfait pour vos projets de construction
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              onClick={() => navigate('/equipment')}
              sx={{ mt: 2 }}
            >
              Découvrir les engins
            </Button>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Box
              component="img"
              src="/images/hero-image.jpg"
              alt="Engin de chantier"
              sx={{
                width: '100%',
                height: 'auto',
                borderRadius: 2,
                boxShadow: 3
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Features Section */}
      <Box sx={{ 
        py: 8,
        px: { xs: 2, sm: 4, md: 8 },
        width: '100%'
      }}>
        <Box sx={{ maxWidth: 'lg', mx: 'auto' }}>
          <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
            Pourquoi nous choisir ?
          </Typography>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { 
              xs: '1fr',
              sm: '1fr 1fr',
              md: '1fr 1fr 1fr 1fr'
            },
            gap: 4,
            mt: 2 
          }}>
            {features.map((feature, index) => (
              <Card key={index} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                  <Box sx={{ color: 'primary.main', mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      </Box>

      {/* CTA Section */}
      <Box sx={{ 
        bgcolor: 'grey.100', 
        py: 8,
        px: { xs: 2, sm: 4, md: 8 },
        width: '100%'
      }}>
        <Box sx={{ maxWidth: 'md', mx: 'auto' }}>
          <Card sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h4" component="h2" gutterBottom>
              {isAuthenticated ? 'Accédez à votre espace' : 'Prêt à commencer ?'}
            </Typography>
            <Typography variant="body1" paragraph>
              {isAuthenticated 
                ? 'Gérez vos locations et votre profil en quelques clics.'
                : 'Rejoignez notre communauté de professionnels et commencez à louer vos engins dès aujourd\'hui.'}
            </Typography>
            {isAuthenticated ? (
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={() => navigate('/profile')}
                >
                  Mon Profil
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  size="large"
                  onClick={() => navigate('/dashboard')}
                >
                  Tableau de bord
                </Button>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={() => navigate('/register')}
                >
                  S'inscrire
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  size="large"
                  onClick={() => navigate('/login')}
                >
                  Se connecter
                </Button>
              </Box>
            )}
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default Home; 