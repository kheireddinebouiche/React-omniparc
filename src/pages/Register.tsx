import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import {
  Box,
  Container,
  Heading,
  Text,
  Input,
  Button,
  VStack,
  HStack,
  SimpleGrid,
  useColorModeValue,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Alert,
  AlertIcon,
  Spinner,
  useSteps,
  Step,
  StepDescription,
  StepIcon,
  StepIndicator,
  StepNumber,
  StepSeparator,
  StepStatus,
  StepTitle,
  Stepper,
  Card,
  CardBody,
  Icon,
} from '@chakra-ui/react';
import { register, clearError } from '../store/slices/authSlice';
import { UserRole } from '../types';
import { FaUser, FaBuilding, FaTools } from 'react-icons/fa';

const steps = [
  { title: 'Sélection du niveau', description: 'Choisissez votre type de compte' },
  { title: 'Informations personnelles', description: 'Remplissez vos informations' }
];

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, user } = useSelector((state: RootState) => state.auth);
  const isAuthenticated = !!user;
  const { activeStep, setActiveStep } = useSteps({
    index: 0,
    count: steps.length,
  });
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: '' as UserRole,
  });

  const cardBg = useColorModeValue('white', 'gray.800');
  const cardBorder = useColorModeValue('gray.200', 'gray.700');
  const selectedBorder = useColorModeValue('primary.500', 'primary.300');

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
    setActiveStep(activeStep + 1);
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
          <Box mt={8}>
            <Heading as="h2" size="lg" textAlign="center" mb={6}>
              Choisissez votre niveau d'accès
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mt={4}>
              <Card 
                cursor="pointer"
                borderWidth={formData.role === UserRole.CLIENT ? 2 : 1}
                borderColor={formData.role === UserRole.CLIENT ? selectedBorder : cardBorder}
                _hover={{ borderColor: selectedBorder, borderWidth: 2 }}
                onClick={() => setFormData(prev => ({ ...prev, role: UserRole.CLIENT }))}
              >
                <CardBody textAlign="center">
                  <Icon as={FaUser} boxSize={12} color="primary.500" mb={4} />
                  <Heading as="h3" size="md" mb={2}>
                    Client
                  </Heading>
                  <Text color="gray.600">
                    Je souhaite louer des engins pour mes projets
                  </Text>
                </CardBody>
              </Card>
              
              <Card 
                cursor="pointer"
                borderWidth={formData.role === UserRole.PROFESSIONAL ? 2 : 1}
                borderColor={formData.role === UserRole.PROFESSIONAL ? selectedBorder : cardBorder}
                _hover={{ borderColor: selectedBorder, borderWidth: 2 }}
                onClick={() => setFormData(prev => ({ ...prev, role: UserRole.PROFESSIONAL }))}
              >
                <CardBody textAlign="center">
                  <Icon as={FaTools} boxSize={12} color="primary.500" mb={4} />
                  <Heading as="h3" size="md" mb={2}>
                    Professionnel
                  </Heading>
                  <Text color="gray.600">
                    Je souhaite mettre mes engins en location
                  </Text>
                </CardBody>
              </Card>
              
              <Card 
                cursor="pointer"
                borderWidth={formData.role === UserRole.BUSINESS ? 2 : 1}
                borderColor={formData.role === UserRole.BUSINESS ? selectedBorder : cardBorder}
                _hover={{ borderColor: selectedBorder, borderWidth: 2 }}
                onClick={() => setFormData(prev => ({ ...prev, role: UserRole.BUSINESS }))}
              >
                <CardBody textAlign="center">
                  <Icon as={FaBuilding} boxSize={12} color="primary.500" mb={4} />
                  <Heading as="h3" size="md" mb={2}>
                    Entreprise
                  </Heading>
                  <Text color="gray.600">
                    Je représente une entreprise de location d'engins
                  </Text>
                </CardBody>
              </Card>
            </SimpleGrid>
          </Box>
        );
      case 1:
        return (
          <Box as="form" onSubmit={handleSubmit} mt={8}>
            {error && (
              <Alert status="error" mb={4}>
                <AlertIcon />
                {error}
              </Alert>
            )}
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Prénom</FormLabel>
                <Input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Nom</FormLabel>
                <Input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Mot de passe</FormLabel>
                <Input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                />
              </FormControl>
            </VStack>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Container maxW="md" py={8}>
      <Box mt={8} mb={4}>
        <Heading as="h1" size="xl" textAlign="center" mb={4}>
          Créer un compte
        </Heading>
        <Text textAlign="center" color="gray.600">
          Rejoignez notre communauté de professionnels
        </Text>
      </Box>
      
      <Stepper index={activeStep} colorScheme="primary" mb={8}>
        {steps.map((step, index) => (
          <Step key={index}>
            <StepIndicator>
              <StepStatus
                complete={<StepIcon />}
                incomplete={<StepNumber />}
                active={<StepNumber />}
              />
            </StepIndicator>
            <Box flexShrink="0">
              <StepTitle>{step.title}</StepTitle>
              <StepDescription>{step.description}</StepDescription>
            </Box>
            <StepSeparator />
          </Step>
        ))}
      </Stepper>
      
      {renderStepContent(activeStep)}
      
      <HStack justify="space-between" mt={8}>
        <Button
          onClick={handleBack}
          isDisabled={activeStep === 0}
          variant="outline"
        >
          Retour
        </Button>
        <Button
          onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
          colorScheme="primary"
          isLoading={loading}
          loadingText="Chargement..."
        >
          {activeStep === steps.length - 1 ? 'S\'inscrire' : 'Suivant'}
        </Button>
      </HStack>
    </Container>
  );
};

export default Register; 