import { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Box,
  Heading,
  Input,
  Button,
  Link,
  Alert,
  AlertIcon,
  Spinner,
  VStack,
  FormControl,
  FormLabel,
  useToast,
} from '@chakra-ui/react';
import { login, clearError } from '../store/slices/authSlice';
import { RootState, AppDispatch } from '../store';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, user } = useSelector((state: RootState) => state.auth);
  const isAuthenticated = !!user;
  const toast = useToast();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    await dispatch(login(formData));
  };

  return (
    <Container maxW="md" py={10}>
      <Box
        mt={8}
        display="flex"
        flexDirection="column"
        alignItems="center"
      >
        <Box
          p={8}
          display="flex"
          flexDirection="column"
          alignItems="center"
          width="100%"
          borderRadius="lg"
          boxShadow="lg"
          bg="white"
        >
          <Heading as="h1" size="lg" mb={6}>
            Connexion
          </Heading>
          {error && (
            <Alert status="error" mb={4} width="100%">
              <AlertIcon />
              {error}
            </Alert>
          )}
          <Box as="form" onSubmit={handleSubmit} width="100%">
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Adresse email</FormLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  value={formData.email}
                  onChange={handleChange}
                  isDisabled={loading}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Mot de passe</FormLabel>
                <Input
                  name="password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  isDisabled={loading}
                />
              </FormControl>
              <Button
                type="submit"
                width="100%"
                colorScheme="blue"
                mt={6}
                mb={4}
                isLoading={loading}
                loadingText="Connexion en cours..."
              >
                Se connecter
              </Button>
              <Box textAlign="center">
                <Link as={RouterLink} to="/register" color="blue.500">
                  Vous n'avez pas de compte ? Inscrivez-vous
                </Link>
              </Box>
            </VStack>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default Login; 