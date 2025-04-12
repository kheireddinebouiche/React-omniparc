import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { UserRole } from '../types';
import * as authService from '../services/authService';
import {
  Box,
  Container,
  Heading,
  Button,
  VStack,
  Text,
  useToast,
} from '@chakra-ui/react';

const UpdateRole = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleUpdateRole = async (newRole: UserRole) => {
    if (!user) return;
    
    try {
      setLoading(true);
      await authService.updateUserRole(user.id, newRole);
      toast({
        title: "Rôle mis à jour",
        description: `Votre rôle a été mis à jour vers ${newRole}`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour du rôle",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Container maxW="container.md" py={8}>
        <Text>Vous devez être connecté pour accéder à cette page.</Text>
      </Container>
    );
  }

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={6}>
        <Heading>Mise à jour du rôle</Heading>
        <Text>Rôle actuel : {user.role}</Text>
        <Box>
          <Button
            colorScheme="blue"
            onClick={() => handleUpdateRole(UserRole.ADMIN)}
            isLoading={loading}
            mr={4}
          >
            Définir comme ADMIN
          </Button>
          <Button
            colorScheme="green"
            onClick={() => handleUpdateRole(UserRole.PROFESSIONAL)}
            isLoading={loading}
            mr={4}
          >
            Définir comme PROFESSIONAL
          </Button>
          <Button
            colorScheme="purple"
            onClick={() => handleUpdateRole(UserRole.BUSINESS)}
            isLoading={loading}
            mr={4}
          >
            Définir comme BUSINESS
          </Button>
          <Button
            colorScheme="gray"
            onClick={() => handleUpdateRole(UserRole.CLIENT)}
            isLoading={loading}
          >
            Définir comme CLIENT
          </Button>
        </Box>
      </VStack>
    </Container>
  );
};

export default UpdateRole; 