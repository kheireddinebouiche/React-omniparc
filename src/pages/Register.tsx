import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Alert,
} from '@mui/material';
import { register, clearError } from '../store/slices/authSlice';
import { UserRole } from '../types';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import ConstructionIcon from '@mui/icons-material/Construction';

const steps = ['Sélection du niveau', 'Informations personnelles'];

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, user } = useSelector((state: RootState) => state.auth);
  const isAuthenticated = !!user;
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: '' as UserRole,
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleNext = () => {
    if (activeStep === 0 && !formData.role) {
      dispatch(clearError());
      return;
    }
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name as string]: value,
    }));
    if (error) {
      dispatch(clearError());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(register(formData));
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom textAlign="center">
              Choisissez votre niveau d'accès
            </Typography>
            <Box sx={{ 
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(3, 1fr)'
              },
              gap: 3,
              mt: 2
            }}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  border: formData.role === UserRole.CLIENT ? 2 : 0,
                  borderColor: 'primary.main',
                  '&:hover': { border: 2, borderColor: 'primary.main' }
                }}
                onClick={() => setFormData(prev => ({ ...prev, role: UserRole.CLIENT }))}
              >
                <CardContent sx={{ textAlign: 'center' }}>
                  <PersonIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Client
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pour les particuliers qui souhaitent louer des équipements
                  </Typography>
                </CardContent>
              </Card>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  border: formData.role === UserRole.PROFESSIONAL ? 2 : 0,
                  borderColor: 'primary.main',
                  '&:hover': { border: 2, borderColor: 'primary.main' }
                }}
                onClick={() => setFormData(prev => ({ ...prev, role: UserRole.PROFESSIONAL }))}
              >
                <CardContent sx={{ textAlign: 'center' }}>
                  <ConstructionIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Professionnel
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pour les professionnels du bâtiment
                  </Typography>
                </CardContent>
              </Card>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  border: formData.role === UserRole.BUSINESS ? 2 : 0,
                  borderColor: 'primary.main',
                  '&:hover': { border: 2, borderColor: 'primary.main' }
                }}
                onClick={() => setFormData(prev => ({ ...prev, role: UserRole.BUSINESS }))}
              >
                <CardContent sx={{ textAlign: 'center' }}>
                  <BusinessIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Entreprise
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pour les entreprises de location d'équipements
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>
        );
      case 1:
        return (
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
            <Box sx={{ mt: 4 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <TextField
                  required
                  fullWidth
                  label="Prénom"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  disabled={loading}
                />
                <TextField
                  required
                  fullWidth
                  label="Nom"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </Box>
              <Box sx={{ mt: 2 }}>
                <TextField
                  required
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </Box>
              <Box sx={{ mt: 2 }}>
                <TextField
                  required
                  fullWidth
                  label="Mot de passe"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </Box>
            </Box>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Inscription
        </Typography>
        <Stepper activeStep={activeStep} sx={{ mt: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        {renderStepContent(activeStep)}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0 || loading}
            onClick={handleBack}
          >
            Retour
          </Button>
          <Button
            variant="contained"
            onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : activeStep === steps.length - 1 ? (
              'S\'inscrire'
            ) : (
              'Suivant'
            )}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Register; 