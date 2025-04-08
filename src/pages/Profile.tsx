import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Box,
  Heading,
  Text,
  Input,
  Button,
  VStack,
  HStack,
  Grid,
  Alert,
  AlertIcon,
  Spinner,
  Avatar,
  Divider,
  FormControl,
  FormLabel,
  useColorModeValue,
  Card,
  CardBody,
} from '@chakra-ui/react';
import { RootState, AppDispatch } from '../store';
import { updateProfile } from '../store/slices/authSlice';
import { User } from '../types';

const Profile = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading, error } = useSelector((state: RootState) => state.auth);
  const [formData, setFormData] = useState<Partial<User>>({
    firstName: '',
    lastName: '',
    email: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      await dispatch(updateProfile({ ...user, ...formData }));
      setSuccessMessage('Profil mis à jour avec succès');
      setIsEditing(false);
    }
  };

  if (!user) {
    return (
      <Container>
        <Heading as="h1" size="lg" mb={4}>
          Veuillez vous connecter pour accéder à votre profil
        </Heading>
      </Container>
    );
  }

  return (
    <Container maxW="md" py={8}>
      <Card bg={cardBg} borderRadius="lg" boxShadow="md">
        <CardBody p={6}>
          <HStack align="center" mb={6}>
            <Avatar
              size="xl"
              bg="primary.500"
              color="white"
              fontSize="2xl"
              name={`${user.firstName} ${user.lastName}`}
            >
              {user.firstName[0]}
              {user.lastName[0]}
            </Avatar>
            <Box>
              <Heading as="h1" size="xl">
                {user.firstName} {user.lastName}
              </Heading>
              <Text color={textColor}>
                {user.role}
              </Text>
            </Box>
          </HStack>

          {error && (
            <Alert status="error" mb={4}>
              <AlertIcon />
              {error}
            </Alert>
          )}

          {successMessage && (
            <Alert status="success" mb={4}>
              <AlertIcon />
              {successMessage}
            </Alert>
          )}

          <Divider my={6} />

          {isEditing ? (
            <Box as="form" onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <FormControl>
                  <FormLabel>Prénom</FormLabel>
                  <Input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Nom</FormLabel>
                  <Input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Email</FormLabel>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </FormControl>
                <HStack spacing={4} width="100%" justify="flex-end">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                  >
                    Annuler
                  </Button>
                  <Button
                    colorScheme="primary"
                    type="submit"
                    isLoading={loading}
                    loadingText="Enregistrement..."
                  >
                    Enregistrer
                  </Button>
                </HStack>
              </VStack>
            </Box>
          ) : (
            <VStack align="stretch" spacing={4}>
              <Grid templateColumns="1fr 2fr" gap={4}>
                <Text fontWeight="bold">Prénom:</Text>
                <Text>{user.firstName}</Text>
                <Text fontWeight="bold">Nom:</Text>
                <Text>{user.lastName}</Text>
                <Text fontWeight="bold">Email:</Text>
                <Text>{user.email}</Text>
                <Text fontWeight="bold">Rôle:</Text>
                <Text>{user.role}</Text>
              </Grid>
              <Button
                colorScheme="primary"
                onClick={() => setIsEditing(true)}
                alignSelf="flex-end"
              >
                Modifier le profil
              </Button>
            </VStack>
          )}
        </CardBody>
      </Card>
    </Container>
  );
};

export default Profile; 