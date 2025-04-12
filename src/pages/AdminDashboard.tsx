import React, { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Container,
  Box,
  Text,
  Heading,
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  SimpleGrid,
  useToast,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  HStack,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  Switch,
  VStack,
} from '@chakra-ui/react';
import {
  FaEdit,
  FaEye,
  FaUserShield,
  FaBuilding,
  FaTools,
} from 'react-icons/fa';
import { RootState } from '../store';
import { User, UserRole, Equipment, Address } from '../types';
import { VerificationStatus } from '../types/enums';
import * as userService from '../services/userService';
import * as equipmentService from '../services/equipmentService';

const AdminDashboard: FC = (): JSX.Element => {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useSelector((state: RootState) => state.auth) as { user: User | null };
  const [users, setUsers] = useState<User[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<User>>({});
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        if (user && user.role === 'ADMIN') {
          const [usersData, equipmentData] = await Promise.all([
            userService.getAllUsers(),
            equipmentService.getEquipments()
          ]);
          setUsers(usersData);
          setEquipment(equipmentData);
        } else {
          navigate('/dashboard');
        }
      } catch (err) {
        setError("Erreur lors du chargement des données");
        toast({
          title: "Erreur",
          description: "Impossible de charger les données du tableau de bord administrateur",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user, navigate, toast]);

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      companyName: user.companyName,
      siret: user.siret,
      address: user.address,
      deliveryAddress: user.deliveryAddress,
      isActive: user.isActive,
      verificationStatus: user.verificationStatus
    });
    onOpen();
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleAddressChange = (field: 'address' | 'deliveryAddress', key: keyof Address, value: string) => {
    setEditFormData(prev => {
      const currentAddress = prev[field] as Address || { street: '', city: '', postalCode: '', country: '' };
      return {
        ...prev,
        [field]: {
          ...currentAddress,
          [key]: value
        }
      };
    });
  };

  const handleSubmit = async () => {
    if (!selectedUser) return;
    
    try {
      await userService.updateUser(selectedUser.id, editFormData);
      toast({
        title: "Utilisateur mis à jour",
        description: "Les informations de l'utilisateur ont été mises à jour avec succès.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      
      const updatedUsers = await userService.getAllUsers();
      setUsers(updatedUsers);
      onClose();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'utilisateur.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'green';
      case 'REJECTED':
        return 'red';
      case 'PENDING':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrateur';
      case 'PROFESSIONAL':
        return 'Professionnel';
      case 'BUSINESS':
        return 'Entreprise';
      case 'CLIENT':
        return 'Client';
      default:
        return role;
    }
  };

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="blue.500" thickness="4px" />
      </Center>
    );
  }

  if (error) {
    return (
      <Container maxW="container.xl" p={4}>
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" p={4}>
      <Box>
        <Heading mb={6}>Tableau de bord administrateur</Heading>
        
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={6}>
          <Card>
            <CardBody>
              <HStack>
                <Box p={3} bg="blue.100" borderRadius="md">
                  <FaUserShield size={24} color="#3182CE" />
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.500">Utilisateurs</Text>
                  <Heading size="md">{users.length}</Heading>
                </Box>
              </HStack>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <HStack>
                <Box p={3} bg="green.100" borderRadius="md">
                  <FaTools size={24} color="#38A169" />
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.500">Équipements</Text>
                  <Heading size="md">{equipment.length}</Heading>
                </Box>
              </HStack>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <HStack>
                <Box p={3} bg="purple.100" borderRadius="md">
                  <FaBuilding size={24} color="#805AD5" />
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.500">Professionnels</Text>
                  <Heading size="md">{users.filter(u => u.role === 'PROFESSIONAL').length}</Heading>
                </Box>
              </HStack>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <HStack>
                <Box p={3} bg="orange.100" borderRadius="md">
                  <FaBuilding size={24} color="#DD6B20" />
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.500">Entreprises</Text>
                  <Heading size="md">{users.filter(u => u.role === 'BUSINESS').length}</Heading>
                </Box>
              </HStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        <Box mb={8}>
          <Heading size="md" mb={4}>Gestion des utilisateurs</Heading>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Nom</Th>
                <Th>Email</Th>
                <Th>Rôle</Th>
                <Th>Statut</Th>
                <Th>Vérification</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {users.map((user) => (
                <Tr key={user.id}>
                  <Td>{`${user.firstName} ${user.lastName}`}</Td>
                  <Td>{user.email}</Td>
                  <Td>{getRoleLabel(user.role)}</Td>
                  <Td>
                    <Badge colorScheme={user.isActive ? 'green' : 'red'}>
                      {user.isActive ? 'Actif' : 'Inactif'}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge colorScheme={
                      user.verificationStatus === VerificationStatus.APPROVED ? 'green' :
                      user.verificationStatus === VerificationStatus.REJECTED ? 'red' : 'yellow'
                    }>
                      {user.verificationStatus}
                    </Badge>
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      <IconButton
                        aria-label="Voir l'utilisateur"
                        icon={<FaEye />}
                        size="sm"
                        onClick={() => navigate(`/users/${user.id}`)}
                      />
                      <IconButton
                        aria-label="Modifier l'utilisateur"
                        icon={<FaEdit />}
                        size="sm"
                        onClick={() => handleEditUser(user)}
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        <Box>
          <Heading size="md" mb={4}>Actions rapides</Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            <Card>
              <CardHeader>
                <Heading size="md">Utilisateurs</Heading>
              </CardHeader>
              <CardBody>
                <Text>Gérer les utilisateurs et leurs rôles</Text>
              </CardBody>
              <CardFooter>
                <Button onClick={() => navigate('/users')}>Gérer les utilisateurs</Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <Heading size="md">Équipements</Heading>
              </CardHeader>
              <CardBody>
                <Text>Gérer tous les équipements</Text>
              </CardBody>
              <CardFooter>
                <Button onClick={() => navigate('/equipment')}>Gérer les équipements</Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <Heading size="md">Locations</Heading>
              </CardHeader>
              <CardBody>
                <Text>Gérer les demandes de location</Text>
              </CardBody>
              <CardFooter>
                <Button onClick={() => navigate('/rentals')}>Gérer les locations</Button>
              </CardFooter>
            </Card>
          </SimpleGrid>
        </Box>
      </Box>

      {/* Modal d'édition d'utilisateur */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Modifier l'utilisateur</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Prénom</FormLabel>
                <Input
                  name="firstName"
                  value={editFormData.firstName || ''}
                  onChange={handleFormChange}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Nom</FormLabel>
                <Input
                  name="lastName"
                  value={editFormData.lastName || ''}
                  onChange={handleFormChange}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input
                  name="email"
                  value={editFormData.email || ''}
                  isReadOnly
                />
              </FormControl>
              <FormControl>
                <FormLabel>Téléphone</FormLabel>
                <Input
                  name="phoneNumber"
                  value={editFormData.phoneNumber || ''}
                  onChange={handleFormChange}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Rôle</FormLabel>
                <Select
                  name="role"
                  value={editFormData.role || ''}
                  onChange={handleFormChange}
                >
                  <option value="CLIENT">Client</option>
                  <option value="PROFESSIONAL">Professionnel</option>
                  <option value="BUSINESS">Entreprise</option>
                  <option value="ADMIN">Administrateur</option>
                </Select>
              </FormControl>
              {(editFormData.role === 'PROFESSIONAL' || editFormData.role === 'BUSINESS') && (
                <>
                  <FormControl>
                    <FormLabel>Nom de l'entreprise</FormLabel>
                    <Input
                      name="companyName"
                      value={editFormData.companyName || ''}
                      onChange={handleFormChange}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>SIRET</FormLabel>
                    <Input
                      name="siret"
                      value={editFormData.siret || ''}
                      onChange={handleFormChange}
                    />
                  </FormControl>
                </>
              )}
              <FormControl>
                <FormLabel>Adresse</FormLabel>
                <Input
                  name="address.street"
                  value={((editFormData.address as unknown as Address) || {}).street || ''}
                  onChange={(e) => handleAddressChange('address', 'street', e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Ville</FormLabel>
                <Input
                  name="address.city"
                  value={((editFormData.address as unknown as Address) || {}).city || ''}
                  onChange={(e) => handleAddressChange('address', 'city', e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Code postal</FormLabel>
                <Input
                  name="address.postalCode"
                  value={((editFormData.address as unknown as Address) || {}).postalCode || ''}
                  onChange={(e) => handleAddressChange('address', 'postalCode', e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Pays</FormLabel>
                <Input
                  name="address.country"
                  value={((editFormData.address as unknown as Address) || {}).country || ''}
                  onChange={(e) => handleAddressChange('address', 'country', e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Adresse de livraison</FormLabel>
                <Input
                  name="deliveryAddress.street"
                  value={(editFormData.deliveryAddress as Address)?.street || ''}
                  onChange={(e) => handleAddressChange('deliveryAddress', 'street', e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Ville</FormLabel>
                <Input
                  name="deliveryAddress.city"
                  value={(editFormData.deliveryAddress as Address)?.city || ''}
                  onChange={(e) => handleAddressChange('deliveryAddress', 'city', e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Code postal</FormLabel>
                <Input
                  name="deliveryAddress.postalCode"
                  value={(editFormData.deliveryAddress as Address)?.postalCode || ''}
                  onChange={(e) => handleAddressChange('deliveryAddress', 'postalCode', e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Pays</FormLabel>
                <Input
                  name="deliveryAddress.country"
                  value={(editFormData.deliveryAddress as Address)?.country || ''}
                  onChange={(e) => handleAddressChange('deliveryAddress', 'country', e.target.value)}
                />
              </FormControl>
              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">Compte actif</FormLabel>
                <Switch
                  name="isActive"
                  isChecked={editFormData.isActive}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Statut de vérification</FormLabel>
                <Select
                  name="verificationStatus"
                  value={editFormData.verificationStatus || ''}
                  onChange={handleFormChange}
                >
                  <option value={VerificationStatus.PENDING}>En attente</option>
                  <option value={VerificationStatus.APPROVED}>Approuvé</option>
                  <option value={VerificationStatus.REJECTED}>Rejeté</option>
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
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

export default AdminDashboard; 