import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Text,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Input,
  Badge,
  Grid,
  Card,
  CardBody,
  Select,
  FormControl,
  FormLabel,
  Alert,
  AlertIcon,
  Progress,
  Avatar,
  Tooltip,
  useDisclosure,
  VStack,
  HStack,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  FaEdit,
  FaTrash,
  FaBan,
  FaCheckCircle,
  FaUser,
  FaBuilding,
  FaTools,
  FaUserShield,
  FaChartLine,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaUsers,
  FaEnvelope,
} from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { UserRole } from '../types';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

const AdminPanel = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<UserRole | 'ALL'>('ALL');

  // Simuler le chargement des utilisateurs
  useEffect(() => {
    // TODO: Remplacer par un appel API réel
    const mockUsers: User[] = [
      {
        id: '1',
        email: 'user1@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.CLIENT,
        isActive: true,
        createdAt: '2024-01-01',
        lastLogin: '2024-04-08',
      },
      {
        id: '2',
        email: 'user2@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        role: UserRole.PROFESSIONAL,
        isActive: true,
        createdAt: '2024-02-15',
        lastLogin: '2024-04-07',
      },
      // Ajouter plus d'utilisateurs de test si nécessaire
    ];
    setUsers(mockUsers);
  }, []);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    onOpen();
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        // TODO: Implémenter la suppression d'utilisateur
        console.log('Suppression de l\'utilisateur:', userId);
      } catch (error) {
        setError('Erreur lors de la suppression de l\'utilisateur');
      }
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      // TODO: Implémenter le changement de statut
      console.log('Changement de statut pour l\'utilisateur:', userId, !currentStatus);
    } catch (error) {
      setError('Erreur lors du changement de statut');
    }
  };

  const handleCloseDialog = () => {
    onClose();
    setSelectedUser(null);
    setError('');
  };

  const handleSubmit = async () => {
    if (!selectedUser) return;

    try {
      // TODO: Implémenter la mise à jour de l'utilisateur
      console.log('Mise à jour de l\'utilisateur:', selectedUser);
      handleCloseDialog();
    } catch (error) {
      setError('Erreur lors de la mise à jour de l\'utilisateur');
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterRole(event.target.value as UserRole | 'ALL');
  };

  const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (selectedUser) {
      setSelectedUser({
        ...selectedUser,
        role: event.target.value as UserRole
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'ALL' || user.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  if (user?.role !== UserRole.ADMIN) {
    return (
      <Container maxW="xl" py={4} px={{ base: 2, sm: 3, md: 4 }}>
        <Alert status="error">
          <AlertIcon />
          Accès non autorisé. Vous devez être administrateur pour accéder à cette page.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="xl" py={4} px={{ base: 2, sm: 3, md: 4 }}>
      <Box mb={4}>
        <Heading as="h1" size="xl" mb={2} color="primary.500">
          Administration des utilisateurs
        </Heading>
        <Text color="gray.600">
          Gérez les comptes utilisateurs et leurs permissions
        </Text>
      </Box>

      {/* Filtres et recherche */}
      <Card mb={4} p={3} borderRadius="lg">
        <HStack spacing={2} flexWrap="wrap">
          <FormControl maxW="200px">
            <Input
              placeholder="Rechercher"
              size="sm"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </FormControl>
          <FormControl maxW="200px">
            <Select
              size="sm"
              value={filterRole}
              onChange={handleFilterRoleChange}
            >
              <option value="ALL">Tous les rôles</option>
              <option value={UserRole.CLIENT}>Client</option>
              <option value={UserRole.PROFESSIONAL}>Professionnel</option>
              <option value={UserRole.BUSINESS}>Entreprise</option>
            </Select>
          </FormControl>
        </HStack>
      </Card>

      {/* Table des utilisateurs */}
      <Card borderRadius="lg" overflow="hidden">
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Nom</Th>
                <Th>Email</Th>
                <Th>Rôle</Th>
                <Th>Statut</Th>
                <Th>Date d'inscription</Th>
                <Th>Dernière connexion</Th>
                <Th textAlign="right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredUsers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user) => (
                  <Tr key={user.id}>
                    <Td>{`${user.firstName} ${user.lastName}`}</Td>
                    <Td>{user.email}</Td>
                    <Td>
                      <Badge
                        colorScheme={
                          user.role === UserRole.ADMIN
                            ? 'red'
                            : user.role === UserRole.PROFESSIONAL
                            ? 'blue'
                            : user.role === UserRole.BUSINESS
                            ? 'purple'
                            : 'gray'
                        }
                        p={1}
                        borderRadius="md"
                      >
                        {user.role}
                      </Badge>
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={user.isActive ? 'green' : 'red'}
                        p={1}
                        borderRadius="md"
                      >
                        {user.isActive ? 'Actif' : 'Inactif'}
                      </Badge>
                    </Td>
                    <Td>{new Date(user.createdAt).toLocaleDateString()}</Td>
                    <Td>
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleDateString()
                        : 'Jamais'}
                    </Td>
                    <Td textAlign="right">
                      <HStack spacing={2} justify="flex-end">
                        <Tooltip label="Modifier">
                          <IconButton
                            aria-label="Modifier"
                            icon={<FaEdit />}
                            colorScheme="blue"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                          />
                        </Tooltip>
                        <Tooltip label={user.isActive ? "Désactiver" : "Activer"}>
                          <IconButton
                            aria-label={user.isActive ? "Désactiver" : "Activer"}
                            icon={user.isActive ? <FaBan /> : <FaCheckCircle />}
                            colorScheme={user.isActive ? "red" : "green"}
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                          />
                        </Tooltip>
                        <Tooltip label="Supprimer">
                          <IconButton
                            aria-label="Supprimer"
                            icon={<FaTrash />}
                            colorScheme="red"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                          />
                        </Tooltip>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
            </Tbody>
          </Table>
        </Box>
        <Box p={4}>
          <HStack justify="space-between">
            <Text fontSize="sm">
              Affichage de {page * rowsPerPage + 1} à {Math.min((page + 1) * rowsPerPage, filteredUsers.length)} sur {filteredUsers.length} utilisateurs
            </Text>
            <HStack>
              <Button
                size="sm"
                onClick={() => setPage(Math.max(0, page - 1))}
                isDisabled={page === 0}
              >
                Précédent
              </Button>
              <Button
                size="sm"
                onClick={() => setPage(page + 1)}
                isDisabled={(page + 1) * rowsPerPage >= filteredUsers.length}
              >
                Suivant
              </Button>
            </HStack>
          </HStack>
        </Box>
      </Card>

      {/* Modal de modification */}
      <Modal isOpen={isOpen} onClose={handleCloseDialog} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {error && (
              <Alert status="error" mb={4}>
                <AlertIcon />
                {error}
              </Alert>
            )}
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input
                  value={selectedUser?.email || ''}
                  isDisabled
                />
              </FormControl>
              <FormControl>
                <FormLabel>Prénom</FormLabel>
                <Input
                  value={selectedUser?.firstName || ''}
                  isDisabled
                />
              </FormControl>
              <FormControl>
                <FormLabel>Nom</FormLabel>
                <Input
                  value={selectedUser?.lastName || ''}
                  isDisabled
                />
              </FormControl>
              <FormControl>
                <FormLabel>Rôle</FormLabel>
                <Select
                  value={selectedUser?.role || UserRole.CLIENT}
                  onChange={handleRoleChange}
                >
                  <option value={UserRole.CLIENT}>Client</option>
                  <option value={UserRole.PROFESSIONAL}>Professionnel</option>
                  <option value={UserRole.BUSINESS}>Entreprise</option>
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleCloseDialog}>
              Annuler
            </Button>
            <Button colorScheme="blue" onClick={handleSubmit}>
              Enregistrer
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default AdminPanel; 