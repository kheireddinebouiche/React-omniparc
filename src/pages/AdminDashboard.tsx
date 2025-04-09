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
  Stack,
  InputGroup,
  InputRightElement,
  Fade,
  ScaleFade,
  SlideFade,
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
import { SearchIcon } from '@chakra-ui/icons';
import { User, UserRole } from '../types';
import * as userService from '../services/userService';
import { useNotification } from '../contexts/NotificationContext';
import NotificationContainer from '../components/NotificationContainer';

const AdminDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: UserRole.CLIENT,
  });
  const [error, setError] = useState('');
  const [filterRole, setFilterRole] = useState<UserRole | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();
  const [searchQuery, setSearchQuery] = useState('');

  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  // Statistiques
  const stats = {
    totalUsers: users.length,
    clients: users.filter(u => u.role === UserRole.CLIENT).length,
    professionals: users.filter(u => u.role === UserRole.PROFESSIONAL).length,
    businesses: users.filter(u => u.role === UserRole.BUSINESS).length,
    activeUsers: users.filter(u => u.isActive).length,
    inactiveUsers: users.filter(u => !u.isActive).length,
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await userService.getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      setError('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    });
    onOpen();
  };

  const handleCloseDialog = () => {
    onClose();
    setSelectedUser(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      role: UserRole.CLIENT,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRoleChange = (userId: string, e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as UserRole;
    userService.updateUser(userId, { role: newRole });
  };

  const handleStatusChange = (userId: string, e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value === 'active';
    userService.updateUserStatus(userId, newStatus);
  };

  const handleSubmit = async () => {
    try {
      if (selectedUser) {
        await userService.updateUser(selectedUser.id, formData);
        await loadUsers();
        handleCloseDialog();
        showNotification('Utilisateur modifié avec succès', 'success');
      }
    } catch (error) {
      setError('Erreur lors de la mise à jour de l\'utilisateur');
      showNotification('Erreur lors de la mise à jour de l\'utilisateur', 'error');
    }
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    onDeleteOpen();
  };

  const handleCloseDeleteDialog = () => {
    onDeleteClose();
    setUserToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (userToDelete) {
      try {
        await userService.deleteUser(userToDelete.id);
        await loadUsers();
        handleCloseDeleteDialog();
        showNotification('Utilisateur supprimé avec succès', 'success');
      } catch (error) {
        setError('Erreur lors de la suppression de l\'utilisateur');
        showNotification('Erreur lors de la suppression de l\'utilisateur', 'error');
      }
    }
  };

  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      console.log('Tentative de modification du statut de connexion:', { userId, currentStatus: isActive, newStatus: !isActive });
      await userService.updateUserStatus(userId, !isActive);
      console.log('Statut de connexion modifié avec succès');
      await loadUsers();
      showNotification(`Compte ${!isActive ? 'activé' : 'désactivé'} avec succès`, 'success');
    } catch (error: any) {
      console.error('Erreur détaillée:', error);
      setError(`Erreur lors de la modification du statut de connexion: ${error.message || 'Erreur inconnue'}`);
      showNotification('Erreur lors de la modification du statut du compte', 'error');
    }
  };

  const filteredUsers = filterRole
    ? users.filter(user => user.role === filterRole)
    : users;

  const StatCard = ({ title, value, icon, color }: { title: string; value: number; icon: React.ReactNode; color: string }) => (
    <Card bg={cardBg} borderRadius="lg" boxShadow="md" overflow="hidden" position="relative">
      <Box
        position="absolute"
        top={0}
        right={0}
        width="100px"
        height="100%"
        opacity={0.1}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        {icon}
      </Box>
      <CardBody>
        <Text color={textColor} fontSize="lg" fontWeight="medium" mb={2}>
          {title}
        </Text>
        <Heading size="xl" color={color}>
          {value}
        </Heading>
      </CardBody>
    </Card>
  );

  return (
    <Box maxW="100vw" px={4} py={8}>
      <Fade in={true}>
        <Box mb={8}>
          <Heading as="h1" size="xl" mb={2}>Tableau de bord administrateur</Heading>
          <Text color="gray.600">Gérez les utilisateurs et surveillez l'activité de la plateforme</Text>
        </Box>
      </Fade>

      {/* Statistiques */}
      <ScaleFade in={true} initialScale={0.9}>
        <Grid
          templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)", lg: "repeat(6, 1fr)" }}
          gap={6}
          mb={8}
        >
          <StatCard
            title="Total Utilisateurs"
            value={stats.totalUsers}
            icon={<FaUsers size={60} />}
            color="primary.500"
          />
          <StatCard
            title="Clients"
            value={stats.clients}
            icon={<FaUser size={60} />}
            color="blue.500"
          />
          <StatCard
            title="Professionnels"
            value={stats.professionals}
            icon={<FaTools size={60} />}
            color="orange.500"
          />
          <StatCard
            title="Entreprises"
            value={stats.businesses}
            icon={<FaBuilding size={60} />}
            color="green.500"
          />
          <StatCard
            title="Utilisateurs Actifs"
            value={stats.activeUsers}
            icon={<FaCheckCircle size={60} />}
            color="green.500"
          />
          <StatCard
            title="Utilisateurs Inactifs"
            value={stats.inactiveUsers}
            icon={<FaBan size={60} />}
            color="red.500"
          />
        </Grid>
      </ScaleFade>

      {/* Filtres */}
      <SlideFade in={true} offsetY="20px">
        <Card p={5} mb={6} borderRadius="lg" boxShadow="md" w="100%">
          <Stack direction={{ base: "column", md: "row" }} spacing={4} align="center">
            <FormControl maxW={{ base: "100%", md: "300px" }}>
              <FormLabel fontWeight="medium">Rechercher un utilisateur</FormLabel>
              <InputGroup>
                <Input
                  placeholder="Nom, email..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                />
                <InputRightElement>
                  <SearchIcon color="gray.400" />
                </InputRightElement>
              </InputGroup>
            </FormControl>
            <FormControl maxW={{ base: "100%", md: "300px" }}>
              <FormLabel fontWeight="medium">Filtrer par rôle</FormLabel>
              <Select
                value={filterRole}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterRole(e.target.value as UserRole || undefined)}
              >
                <option value="">Tous les rôles</option>
                <option value="CLIENT">Clients</option>
                <option value="PROFESSIONAL">Professionnels</option>
                <option value="BUSINESS">Entreprises</option>
              </Select>
            </FormControl>
          </Stack>
        </Card>
      </SlideFade>

      {/* Liste des utilisateurs */}
      <SlideFade in={true} offsetY="20px">
        <Card p={5} borderRadius="lg" boxShadow="md" w="100%">
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Utilisateur</Th>
                  <Th>Email</Th>
                  <Th>Rôle</Th>
                  <Th>Statut</Th>
                  <Th textAlign="right">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredUsers.map((user) => (
                  <Tr key={user.id}>
                    <Td>
                      <HStack spacing={4}>
                        <Avatar bg="primary.500" color="white">
                          {user.firstName[0]}{user.lastName[0]}
                        </Avatar>
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="medium">
                            {user.firstName} {user.lastName}
                          </Text>
                          <Text fontSize="sm" color={textColor}>
                            ID: {user.id}
                          </Text>
                        </VStack>
                      </HStack>
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        <FaEnvelope color={textColor} />
                        <Text>{user.email}</Text>
                      </HStack>
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={
                          user.role === UserRole.CLIENT ? 'blue' :
                          user.role === UserRole.PROFESSIONAL ? 'orange' :
                          'green'
                        }
                        p={2}
                        borderRadius="md"
                      >
                        <HStack spacing={2}>
                          {user.role === UserRole.CLIENT ? <FaUser /> :
                           user.role === UserRole.PROFESSIONAL ? <FaTools /> :
                           <FaBuilding />}
                          <Text>{user.role}</Text>
                        </HStack>
                      </Badge>
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={user.isActive ? 'green' : 'red'}
                        p={2}
                        borderRadius="md"
                      >
                        {user.isActive ? 'Compte actif' : 'Compte désactivé'}
                      </Badge>
                    </Td>
                    <Td textAlign="right">
                      <HStack spacing={2} justify="flex-end">
                        <Tooltip label="Modifier">
                          <IconButton
                            aria-label="Modifier"
                            icon={<FaEdit />}
                            colorScheme="blue"
                            variant="ghost"
                            onClick={() => handleEditUser(user)}
                          />
                        </Tooltip>
                        <Tooltip label="Supprimer">
                          <IconButton
                            aria-label="Supprimer"
                            icon={<FaTrash />}
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => handleDeleteClick(user)}
                          />
                        </Tooltip>
                        <Tooltip label={user.isActive ? "Désactiver le compte" : "Activer le compte"}>
                          <IconButton
                            aria-label={user.isActive ? "Désactiver" : "Activer"}
                            icon={user.isActive ? <FaBan /> : <FaCheckCircle />}
                            colorScheme={user.isActive ? "orange" : "green"}
                            variant="ghost"
                            onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                          />
                        </Tooltip>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Card>
      </SlideFade>

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
                <FormLabel>Prénom</FormLabel>
                <Input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Nom</FormLabel>
                <Input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  isDisabled
                />
              </FormControl>
              <FormControl>
                <FormLabel>Rôle</FormLabel>
                <Select
                  value={formData.role}
                  onChange={(e) => {
                    if (selectedUser) {
                      handleRoleChange(selectedUser.id, e);
                    }
                  }}
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
            <Button colorScheme="primary" onClick={handleSubmit}>
              Enregistrer
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal de confirmation de suppression */}
      <Modal isOpen={isDeleteOpen} onClose={handleCloseDeleteDialog} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color="red.500">
            <HStack spacing={2}>
              <FaExclamationTriangle />
              <Text>Confirmer la suppression</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={4}>
              Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{userToDelete?.firstName} {userToDelete?.lastName}</strong> ?
            </Text>
            <Text color="red.500" fontSize="sm">
              Cette action est irréversible et supprimera définitivement le compte de l'utilisateur.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleCloseDeleteDialog}>
              Annuler
            </Button>
            <Button colorScheme="red" onClick={handleDeleteConfirm}>
              Supprimer
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <NotificationContainer />
    </Box>
  );
};

export default AdminDashboard; 