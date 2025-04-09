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
  InputGroup,
  InputRightElement,
  IconButton,
  useToast,
  ScaleFade,
  Fade,
  SlideFade,
} from '@chakra-ui/react';
import { register, clearError } from '../store/slices/authSlice';
import { UserRole } from '../types';
import { FaUser, FaBuilding, FaTools, FaEye, FaEyeSlash, FaCheck } from 'react-icons/fa';

const steps = [
  { title: 'Sélection du niveau', description: 'Choisissez votre type de compte' },
  { title: 'Informations personnelles', description: 'Remplissez vos informations' }
];

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const toast = useToast();
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

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cardBg = useColorModeValue('white', 'gray.800');
  const cardBorder = useColorModeValue('gray.200', 'gray.700');
  const selectedBorder = useColorModeValue('primary.500', 'primary.300');
  const inputBg = useColorModeValue('white', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleNext = () => {
    if (activeStep === 0 && !formData.role) {
      toast({
        title: "Sélection requise",
        description: "Veuillez sélectionner un type de compte",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
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
    setIsSubmitting(true);
    try {
      await dispatch(register(formData));
      toast({
        title: "Inscription réussie",
        description: "Votre compte a été créé avec succès",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'inscription",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <ScaleFade in={true} initialScale={0.9}>
            <Box mt={8} maxW="4xl" mx="auto">
              <Heading as="h2" size="lg" textAlign="center" mb={6}>
                Choisissez votre niveau d'accès
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mt={4}>
                <Card 
                  cursor="pointer"
                  borderWidth={formData.role === UserRole.CLIENT ? 2 : 1}
                  borderColor={formData.role === UserRole.CLIENT ? selectedBorder : cardBorder}
                  _hover={{ 
                    borderColor: selectedBorder, 
                    borderWidth: 2,
                    transform: 'translateY(-4px)',
                    boxShadow: 'lg',
                    bg: hoverBg,
                  }}
                  transition="all 0.2s"
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
                    {formData.role === UserRole.CLIENT && (
                      <Icon as={FaCheck} color="green.500" mt={4} />
                    )}
                  </CardBody>
                </Card>
                
                <Card 
                  cursor="pointer"
                  borderWidth={formData.role === UserRole.PROFESSIONAL ? 2 : 1}
                  borderColor={formData.role === UserRole.PROFESSIONAL ? selectedBorder : cardBorder}
                  _hover={{ 
                    borderColor: selectedBorder, 
                    borderWidth: 2,
                    transform: 'translateY(-4px)',
                    boxShadow: 'lg',
                    bg: hoverBg,
                  }}
                  transition="all 0.2s"
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
                    {formData.role === UserRole.PROFESSIONAL && (
                      <Icon as={FaCheck} color="green.500" mt={4} />
                    )}
                  </CardBody>
                </Card>
                
                <Card 
                  cursor="pointer"
                  borderWidth={formData.role === UserRole.BUSINESS ? 2 : 1}
                  borderColor={formData.role === UserRole.BUSINESS ? selectedBorder : cardBorder}
                  _hover={{ 
                    borderColor: selectedBorder, 
                    borderWidth: 2,
                    transform: 'translateY(-4px)',
                    boxShadow: 'lg',
                    bg: hoverBg,
                  }}
                  transition="all 0.2s"
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
                    {formData.role === UserRole.BUSINESS && (
                      <Icon as={FaCheck} color="green.500" mt={4} />
                    )}
                  </CardBody>
                </Card>
              </SimpleGrid>
            </Box>
          </ScaleFade>
        );
      case 1:
        return (
          <SlideFade in={true} offsetY="20px">
            <Box as="form" onSubmit={handleSubmit} mt={8} maxW="2xl" mx="auto">
              {error && (
                <Alert status="error" mb={4} borderRadius="md">
                  <AlertIcon />
                  {error}
                </Alert>
              )}
              <VStack spacing={6}>
                <FormControl isRequired>
                  <FormLabel>Prénom</FormLabel>
                  <Input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    bg={inputBg}
                    _hover={{ borderColor: 'primary.500' }}
                    _focus={{ borderColor: 'primary.500', boxShadow: 'outline' }}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Nom</FormLabel>
                  <Input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    bg={inputBg}
                    _hover={{ borderColor: 'primary.500' }}
                    _focus={{ borderColor: 'primary.500', boxShadow: 'outline' }}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    bg={inputBg}
                    _hover={{ borderColor: 'primary.500' }}
                    _focus={{ borderColor: 'primary.500', boxShadow: 'outline' }}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Mot de passe</FormLabel>
                  <InputGroup>
                    <Input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleInputChange}
                      bg={inputBg}
                      _hover={{ borderColor: 'primary.500' }}
                      _focus={{ borderColor: 'primary.500', boxShadow: 'outline' }}
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                        icon={showPassword ? <FaEyeSlash /> : <FaEye />}
                        variant="ghost"
                        onClick={() => setShowPassword(!showPassword)}
                      />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>
              </VStack>
            </Box>
          </SlideFade>
        );
      default:
        return null;
    }
  };

  return (
    <Container maxW="container.lg" py={8}>
      <Fade in={true}>
        <Box mt={8} mb={4} maxW="3xl" mx="auto">
          <Heading as="h1" size="xl" textAlign="center" mb={4}>
            Créer un compte
          </Heading>
          <Text textAlign="center" color="gray.600" fontSize="lg">
            Rejoignez notre communauté de professionnels
          </Text>
        </Box>
      </Fade>
      
      <Box maxW="4xl" mx="auto">
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
        
        <HStack justify="space-between" mt={8} maxW="2xl" mx="auto">
          <Button
            variant="outline"
            onClick={handleBack}
            isDisabled={activeStep === 0}
            _hover={{ transform: 'translateX(-2px)' }}
            transition="all 0.2s"
            size="lg"
            minW="120px"
          >
            Retour
          </Button>
          <Button
            colorScheme="primary"
            onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
            isLoading={isSubmitting}
            loadingText="Inscription en cours..."
            _hover={{ transform: 'translateX(2px)' }}
            transition="all 0.2s"
            size="lg"
            minW="120px"
          >
            {activeStep === steps.length - 1 ? 'S\'inscrire' : 'Suivant'}
          </Button>
        </HStack>
      </Box>
    </Container>
  );
};

export default Register; 