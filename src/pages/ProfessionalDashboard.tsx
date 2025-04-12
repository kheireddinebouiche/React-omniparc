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
  CardBody,
  SimpleGrid,
  useToast,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  HStack,
  IconButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useColorModeValue,
  VStack,
  Divider,
  FormControl,
  FormLabel,
  Input,
  Select,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Textarea,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Switch,
  FormErrorMessage,
} from '@chakra-ui/react';
import {
  FaTools,
  FaCalendarAlt,
  FaEuroSign,
  FaChartLine,
  FaFileUpload,
  FaCheckCircle,
  FaTimesCircle,
  FaEye,
  FaEdit,
  FaTrash,
  FaPlus,
  FaSave,
} from 'react-icons/fa';
import { RootState } from '../store';
import { User, Equipment, RentalRequest, Address } from '../types';
import * as equipmentService from '../services/equipmentService';
import * as rentalService from '../services/rentalService';
import * as userService from '../services/userService';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

type CalendarEvent = {
  start: Date;
  end: Date;
  title: string;
  type: 'available' | 'unavailable';
};

const ProfessionalDashboard: FC = (): JSX.Element => {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useSelector((state: RootState) => state.auth) as { user: User | null };
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [rentalRequests, setRentalRequests] = useState<RentalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'status'>('date');
  const [searchTerm, setSearchTerm] = useState('');
  const [editFormData, setEditFormData] = useState<{
    address: Address;
    deliveryAddress: Address;
  }>({
    address: { street: '', city: '', postalCode: '', country: '' },
    deliveryAddress: { street: '', city: '', postalCode: '', country: '' }
  });
  const [users, setUsers] = useState<{ [key: string]: User }>({});
  const { isOpen: isAddEquipmentOpen, onOpen: onAddEquipmentOpen, onClose: onAddEquipmentClose } = useDisclosure();
  const { isOpen: isEditEquipmentOpen, onOpen: onEditEquipmentOpen, onClose: onEditEquipmentClose } = useDisclosure();
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [equipmentForm, setEquipmentForm] = useState<Partial<Equipment>>({
    name: '',
    description: '',
    price: 0,
    category: '',
    specifications: {},
    location: '',
    isAvailable: true,
    isActive: true,
    isRented: false,
    image: '',
    availabilitySchedule: {},
    minimumRentalPeriod: 1,
    depositAmount: 0
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [availabilityEvents, setAvailabilityEvents] = useState<CalendarEvent[]>([]);

  const localizer = momentLocalizer(moment);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        if (user && (user.role === 'PROFESSIONAL' || user.role === 'BUSINESS')) {
          // Pour les propriétaires, charger les demandes de leurs équipements
          const ownerEquipments = await equipmentService.getEquipmentsByOwner(user.id);
          const equipmentRequests = await Promise.all(
            ownerEquipments.map(eq => rentalService.getRentalRequestsByEquipment(eq.id))
          );
          const allRequests = equipmentRequests.flat();
          setRentalRequests(allRequests);
          setEquipment(ownerEquipments);
        } else {
          // Pour les clients, charger uniquement leurs demandes
          const userRequests = await rentalService.getRentalRequestsByUser(user?.id || '');
          setRentalRequests(userRequests);
        }
      } catch (err) {
        setError("Erreur lors du chargement des données");
        toast({
          title: "Erreur",
          description: "Impossible de charger les données du tableau de bord",
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

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const userIds = new Set<string>();
        rentalRequests.forEach(request => {
          if (request && request.userId && typeof request.userId === 'string') {
            userIds.add(request.userId);
          }
          if (request && request.equipmentOwnerId && typeof request.equipmentOwnerId === 'string') {
            userIds.add(request.equipmentOwnerId);
          }
        });

        const usersData: { [key: string]: User } = {};
        for (const userId of userIds) {
          try {
            const userData = await userService.getUserById(userId);
            if (userData) {
              usersData[userId] = userData;
            }
          } catch (error) {
            console.error(`Erreur lors du chargement de l'utilisateur ${userId}:`, error);
          }
        }
        setUsers(usersData);
      } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs:', error);
      }
    };

    if (rentalRequests && rentalRequests.length > 0) {
      loadUsers();
    }
  }, [rentalRequests]);

  useEffect(() => {
    if (selectedEquipment) {
      const events: CalendarEvent[] = Object.entries(selectedEquipment.availabilitySchedule || {}).map(([day, isAvailable]) => {
        const eventDate = new Date(day + 'T00:00:00');
        const endDate = new Date(day + 'T23:59:59');
        
        return {
          start: eventDate,
          end: endDate,
          title: isAvailable ? 'Disponible' : 'Indisponible',
          type: isAvailable ? 'available' as const : 'unavailable' as const
        };
      });
      
      setAvailabilityEvents(events);
    }
  }, [selectedEquipment]);

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

  const handleAddressChange = (field: 'address' | 'deliveryAddress', key: keyof Address, value: string) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [key]: value
      }
    }));
  };

  const handleRentalAction = async (requestId: string, action: 'approve' | 'reject' | 'complete') => {
    try {
      const request = rentalRequests.find(r => r.id === requestId);
      if (!request) return;

      switch (action) {
        case 'approve':
          await rentalService.updateRentalRequest(requestId, { status: 'APPROVED' });
          toast({
            title: "Demande approuvée",
            description: "La demande de location a été approuvée avec succès",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
          break;
        case 'reject':
          await rentalService.updateRentalRequest(requestId, { status: 'REJECTED' });
          toast({
            title: "Demande rejetée",
            description: "La demande de location a été rejetée",
            status: "info",
            duration: 3000,
            isClosable: true,
          });
          break;
        case 'complete':
          await rentalService.updateRentalRequest(requestId, { status: 'COMPLETED' });
          toast({
            title: "Location terminée",
            description: "La location a été marquée comme terminée",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
          break;
      }

      // Rafraîchir les données
      const updatedRequests = await rentalService.getRentalRequestsByUser(user?.id || '');
      setRentalRequests(updatedRequests);
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'action",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const filteredRequests = rentalRequests
    .filter(request => {
      if (filterStatus !== 'all' && request.status !== filterStatus) return false;
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          request.equipmentName.toLowerCase().includes(searchLower) ||
          request.clientName.toLowerCase().includes(searchLower) ||
          new Date(request.startDate).toLocaleDateString().includes(searchTerm) ||
          new Date(request.endDate).toLocaleDateString().includes(searchTerm)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return a.status.localeCompare(b.status);
    });

  const handleEquipmentFormChange = (field: keyof Equipment, value: any) => {
    setEquipmentForm(prev => ({
      ...prev,
      [field]: value
    }));
    // Effacer l'erreur du champ modifié
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateEquipmentForm = (): boolean => {
    const errors: { [key: string]: string } = {};
    if (!equipmentForm.name?.trim()) {
      errors.name = 'Le nom est requis';
    }
    if (!equipmentForm.category?.trim()) {
      errors.category = 'La catégorie est requise';
    }
    if (!equipmentForm.price || equipmentForm.price <= 0) {
      errors.price = 'Le prix doit être supérieur à 0';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddEquipment = async () => {
    if (!validateEquipmentForm()) {
      toast({
        title: 'Erreur de validation',
        description: 'Veuillez remplir tous les champs requis',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const newEquipment = {
        name: equipmentForm.name || '',
        description: equipmentForm.description || '',
        price: equipmentForm.price || 0,
        category: equipmentForm.category || '',
        specifications: equipmentForm.specifications || {},
        location: equipmentForm.location || '',
        userId: user?.id || '',
        ownerId: user?.id || '',
        isActive: true,
        isAvailable: Boolean(equipmentForm.isAvailable),
        isRented: false,
        image: equipmentForm.image || '',
        availabilitySchedule: equipmentForm.availabilitySchedule || {},
        minimumRentalPeriod: equipmentForm.minimumRentalPeriod || 1,
        depositAmount: equipmentForm.depositAmount || 0,
        maintenanceHistory: []
      };
      
      const addedEquipment = await equipmentService.addEquipment(newEquipment);
      toast({
        title: 'Équipement ajouté',
        description: 'L\'équipement a été ajouté avec succès',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onAddEquipmentClose();
      
      // Rafraîchir la liste des équipements
      const ownerEquipments = await equipmentService.getEquipmentsByOwner(user?.id || '');
      setEquipment(ownerEquipments);
      
      // Ouvrir le modal d'édition avec l'équipement nouvellement créé
      openEditModal(addedEquipment);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de l\'ajout de l\'équipement',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const openEditModal = (eq: Equipment) => {
    console.log('Ouverture du modal d\'édition pour l\'équipement:', eq);
    if (!eq || !eq.id || eq.id === '') {
      console.error('Équipement invalide:', eq);
      toast({
        title: "Erreur",
        description: "Impossible d'ouvrir l'éditeur d'équipement : ID invalide",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setSelectedEquipment(eq);
    setEquipmentForm({
      name: eq.name,
      description: eq.description,
      price: eq.price,
      category: eq.category,
      specifications: eq.specifications,
      location: eq.location,
      isAvailable: eq.isAvailable,
      availabilitySchedule: eq.availabilitySchedule || {},
      minimumRentalPeriod: eq.minimumRentalPeriod || 1,
      depositAmount: eq.depositAmount || 0
    });
    onEditEquipmentOpen();
  };

  const handleEditEquipment = async () => {
    console.log('Début de la mise à jour de l\'équipement');
    console.log('Équipement sélectionné:', selectedEquipment);
    
    if (!validateEquipmentForm() || !selectedEquipment) {
      console.error('Formulaire invalide ou équipement non sélectionné');
      return;
    }

    try {
      if (!selectedEquipment.id) {
        console.error('ID de l\'équipement manquant:', selectedEquipment);
        toast({
          title: "Erreur",
          description: "ID de l'équipement non trouvé",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      console.log('Mise à jour de l\'équipement avec l\'ID:', selectedEquipment.id);
      const updatedEquipment = {
        name: equipmentForm.name || '',
        description: equipmentForm.description || '',
        category: equipmentForm.category || '',
        price: equipmentForm.price || 0,
        isAvailable: Boolean(equipmentForm.isAvailable),
        specifications: equipmentForm.specifications || {},
        location: equipmentForm.location || '',
        userId: user?.id || '',
        ownerId: user?.id || '',
        isActive: Boolean(equipmentForm.isActive),
        isRented: Boolean(equipmentForm.isRented),
        image: equipmentForm.image || '',
        availabilitySchedule: equipmentForm.availabilitySchedule || {},
        minimumRentalPeriod: equipmentForm.minimumRentalPeriod || 1,
        depositAmount: equipmentForm.depositAmount || 0,
        maintenanceHistory: equipmentForm.maintenanceHistory || []
      };

      console.log('Données de mise à jour:', updatedEquipment);
      await equipmentService.updateEquipment(selectedEquipment.id, updatedEquipment);
      toast({
        title: "Équipement mis à jour",
        description: "L'équipement a été mis à jour avec succès",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Rafraîchir la liste des équipements
      const updatedEquipments = await equipmentService.getEquipmentsByOwner(user?.id || '');
      setEquipment(updatedEquipments);
      onEditEquipmentClose();
      setSelectedEquipment(null);
      setEquipmentForm({
        name: '',
        description: '',
        price: 0,
        category: '',
        specifications: {},
        location: '',
        isAvailable: true,
        availabilitySchedule: {},
        minimumRentalPeriod: 1,
        depositAmount: 0
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de mettre à jour l'équipement",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDeleteEquipment = async (equipmentId: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet équipement ?")) return;

    try {
      await equipmentService.deleteEquipment(equipmentId);
      toast({
        title: "Équipement supprimé",
        description: "L'équipement a été supprimé avec succès",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Rafraîchir la liste des équipements
      const updatedEquipment = await equipmentService.getEquipmentsByOwner(user?.id || '');
      setEquipment(updatedEquipment);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'équipement",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleAvailabilityChange = (date: Date) => {
    // Ajuster la date pour éviter les problèmes de fuseau horaire
    const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
    const dateStr = localDate.toISOString().split('T')[0];
    
    setEquipmentForm(prev => {
      const newSchedule = {
        ...prev.availabilitySchedule,
        [dateStr]: !prev.availabilitySchedule?.[dateStr]
      };
      
      // Mettre à jour les événements du calendrier
      const newEvents: CalendarEvent[] = Object.entries(newSchedule).map(([day, isAvailable]) => {
        const eventDate = new Date(day + 'T00:00:00');
        const endDate = new Date(day + 'T23:59:59');
        
        return {
          start: eventDate,
          end: endDate,
          title: isAvailable ? 'Disponible' : 'Indisponible',
          type: isAvailable ? 'available' as const : 'unavailable' as const
        };
      });
      
      setAvailabilityEvents(newEvents);
      
      return {
        ...prev,
        availabilitySchedule: newSchedule
      };
    });
  };

  const handleRemoveAvailability = (event: CalendarEvent) => {
    if (!event?.start) return;
    
    // Ajuster la date pour éviter les problèmes de fuseau horaire
    const localDate = new Date(event.start.getTime() - (event.start.getTimezoneOffset() * 60000));
    const dateStr = localDate.toISOString().split('T')[0];
    
    setEquipmentForm(prev => {
      const newSchedule = {
        ...prev.availabilitySchedule,
        [dateStr]: false
      };
      
      // Mettre à jour les événements du calendrier
      const newEvents: CalendarEvent[] = Object.entries(newSchedule).map(([day, isAvailable]) => {
        const eventDate = new Date(day + 'T00:00:00');
        const endDate = new Date(day + 'T23:59:59');
        
        return {
          start: eventDate,
          end: endDate,
          title: isAvailable ? 'Disponible' : 'Indisponible',
          type: isAvailable ? 'available' as const : 'unavailable' as const
        };
      });
      
      setAvailabilityEvents(newEvents);
      
      return {
        ...prev,
        availabilitySchedule: newSchedule
      };
    });
  };

  const handleMaintenanceAdd = () => {
    setEquipmentForm(prev => ({
      ...prev,
      maintenanceHistory: [
        ...(prev.maintenanceHistory || []),
        {
          date: new Date().toISOString(),
          description: '',
          cost: 0,
          performedBy: '',
          type: 'PREVENTIVE' as const
        }
      ]
    }));
  };

  const handleMaintenanceChange = (index: number, field: keyof { date: string; description: string; cost: number; performedBy: string; }, value: string | number) => {
    setEquipmentForm(prev => ({
      ...prev,
      maintenanceHistory: prev.maintenanceHistory?.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleMaintenanceRemove = (index: number) => {
    setEquipmentForm(prev => ({
      ...prev,
      maintenanceHistory: prev.maintenanceHistory?.filter((_, i) => i !== index)
    }));
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
        <HStack justify="space-between" mb={6}>
          <Heading>Tableau de bord {user?.role === 'PROFESSIONAL' ? 'professionnel' : 'entreprise'}</Heading>
          
        </HStack>
        
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={6}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Équipements</StatLabel>
                <StatNumber>{equipment.length}</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  Total
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Locations en cours</StatLabel>
                <StatNumber>
                  {rentalRequests.filter(r => r.status === 'ACTIVE').length}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  Actives
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Demandes en attente</StatLabel>
                <StatNumber>
                  {rentalRequests.filter(r => r.status === 'PENDING').length}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="decrease" />
                  En attente
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Revenus du mois</StatLabel>
                <StatNumber>
                  {rentalRequests
                    .filter(r => r.status === 'COMPLETED')
                    .reduce((acc, curr) => {
                      const eq = equipment.find(e => e.id === curr.equipmentId);
                      return acc + (eq?.price || 0);
                    }, 0)
                    .toFixed(2)}€
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  Ce mois
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        
        <Tabs onChange={(index) => setActiveTab(index)}>
          <TabList>
            <Tab>Mes équipements</Tab>
            <Tab>Mes locations</Tab>
            <Tab>Maintenance</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Box>
                <HStack justify="space-between" mb={4}>
                  <Heading size="md">Mes équipements</Heading>
                  <Button 
                    leftIcon={<FaTools />} 
                    colorScheme="blue"
                    onClick={onAddEquipmentOpen}
                  >
                    Ajouter un équipement
                  </Button>
                </HStack>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Nom</Th>
                      <Th>Catégorie</Th>
                      <Th>Prix/jour</Th>
                      <Th>Statut</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {equipment.map((eq) => (
                      <Tr key={eq.id}>
                        <Td>{eq.name}</Td>
                        <Td>{eq.category}</Td>
                        <Td>{eq.price}€</Td>
                        <Td>
                          <Badge colorScheme={eq.isAvailable ? 'green' : 'red'}>
                            {eq.isAvailable ? 'Disponible' : 'Indisponible'}
                          </Badge>
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            <IconButton
                              aria-label="Voir l'équipement"
                              icon={<FaEye />}
                              size="sm"
                              onClick={() => navigate(`/equipment/${eq.id}`)}
                            />
                            <IconButton
                              aria-label="Modifier l'équipement"
                              icon={<FaEdit />}
                              size="sm"
                              onClick={() => openEditModal(eq)}
                            />
                            <IconButton
                              aria-label="Supprimer l'équipement"
                              icon={<FaTrash />}
                              size="sm"
                              colorScheme="red"
                              onClick={() => handleDeleteEquipment(eq.id)}
                            />
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </TabPanel>
            <TabPanel>
              <Box>
                <HStack justify="space-between" mb={4}>
                  <Heading size="md">Mes locations</Heading>
                  <Button 
                    leftIcon={<FaCalendarAlt />} 
                    colorScheme="blue"
                    onClick={() => navigate('/rentals')}
                  >
                    Gérer mes locations
                  </Button>
                </HStack>

                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={6}>
                  <Card>
                    <CardBody>
                      <Stat>
                        <StatLabel>Locations en cours</StatLabel>
                        <StatNumber>
                          {rentalRequests.filter(r => r.status === 'ACTIVE').length}
                        </StatNumber>
                        <StatHelpText>
                          <StatArrow type="increase" />
                          Actives
                        </StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>
                  <Card>
                    <CardBody>
                      <Stat>
                        <StatLabel>Demandes en attente</StatLabel>
                        <StatNumber>
                          {rentalRequests.filter(r => r.status === 'PENDING').length}
                        </StatNumber>
                        <StatHelpText>
                          <StatArrow type="decrease" />
                          En attente
                        </StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>
                  <Card>
                    <CardBody>
                      <Stat>
                        <StatLabel>Revenus du mois</StatLabel>
                        <StatNumber>
                          {rentalRequests
                            .filter(r => r.status === 'COMPLETED' && 
                              new Date(r.endDate).getMonth() === new Date().getMonth())
                            .reduce((acc, curr) => {
                              const eq = equipment.find(e => e.id === curr.equipmentId);
                              return acc + (eq?.price || 0);
                            }, 0)
                            .toFixed(2)}€
                        </StatNumber>
                        <StatHelpText>
                          <StatArrow type="increase" />
                          Ce mois
                        </StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>
                </SimpleGrid>

                <HStack spacing={4} mb={4}>
                  <Input
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    maxW="300px"
                  />
                  <Select 
                    value={filterStatus} 
                    onChange={(e) => setFilterStatus(e.target.value)}
                    maxW="200px"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="PENDING">En attente</option>
                    <option value="APPROVED">Approuvées</option>
                    <option value="ACTIVE">En cours</option>
                    <option value="COMPLETED">Terminées</option>
                    <option value="REJECTED">Rejetées</option>
                  </Select>
                  <Select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value as 'date' | 'status')}
                    maxW="200px"
                  >
                    <option value="date">Trier par date</option>
                    <option value="status">Trier par statut</option>
                  </Select>
                </HStack>

                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Équipement</Th>
                      {user?.role === 'PROFESSIONAL' || user?.role === 'BUSINESS' ? (
                        <Th>Client</Th>
                      ) : (
                        <Th>Propriétaire</Th>
                      )}
                      <Th>Date début</Th>
                      <Th>Date fin</Th>
                      <Th>Statut</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredRequests.map((request) => (
                      <Tr key={request.id}>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="bold">{request.equipmentName}</Text>
                            <Text fontSize="sm" color="gray.500">
                              {equipment.find(e => e.id === request.equipmentId)?.name}
                            </Text>
                          </VStack>
                        </Td>
                        <Td>
                          {user?.role === 'PROFESSIONAL' || user?.role === 'BUSINESS' ? (
                            <VStack align="start" spacing={1}>
                              <Text fontWeight="bold">{request.clientName}</Text>
                              <Text fontSize="sm" color="gray.500">
                                {users[request.userId]?.email || 'Chargement...'}
                              </Text>
                            </VStack>
                          ) : (
                            <VStack align="start" spacing={1}>
                              <Text fontWeight="bold">{`${users[request.equipmentOwnerId]?.firstName || ''} ${users[request.equipmentOwnerId]?.lastName || ''}` || 'Chargement...'}</Text>
                              <Text fontSize="sm" color="gray.500">
                                {users[request.equipmentOwnerId]?.email || 'Chargement...'}
                              </Text>
                            </VStack>
                          )}
                        </Td>
                        <Td>{new Date(request.startDate).toLocaleDateString()}</Td>
                        <Td>{new Date(request.endDate).toLocaleDateString()}</Td>
                        <Td>
                          <Badge colorScheme={getStatusColor(request.status)}>
                            {request.status === 'PENDING' ? 'En attente' :
                             request.status === 'APPROVED' ? 'Approuvée' :
                             request.status === 'ACTIVE' ? 'En cours' :
                             request.status === 'COMPLETED' ? 'Terminée' : 'Rejetée'}
                          </Badge>
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            <IconButton
                              aria-label="Voir la demande"
                              icon={<FaEye />}
                              size="sm"
                              onClick={() => navigate(`/rentals/${request.id}`)}
                            />
                            {(user?.role === 'PROFESSIONAL' || user?.role === 'BUSINESS') && 
                             request.status === 'PENDING' && (
                              <>
                                <IconButton
                                  aria-label="Approuver la demande"
                                  icon={<FaCheckCircle />}
                                  size="sm"
                                  colorScheme="green"
                                  onClick={() => handleRentalAction(request.id, 'approve')}
                                />
                                <IconButton
                                  aria-label="Rejeter la demande"
                                  icon={<FaTimesCircle />}
                                  size="sm"
                                  colorScheme="red"
                                  onClick={() => handleRentalAction(request.id, 'reject')}
                                />
                              </>
                            )}
                            {request.status === 'ACTIVE' && 
                             (user?.role === 'PROFESSIONAL' || user?.role === 'BUSINESS') && (
                              <IconButton
                                aria-label="Marquer comme terminée"
                                icon={<FaCheckCircle />}
                                size="sm"
                                colorScheme="blue"
                                onClick={() => handleRentalAction(request.id, 'complete')}
                              />
                            )}
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
                {filteredRequests.length === 0 && (
                  <Center py={8}>
                    <Text color="gray.500">Aucune demande de location trouvée</Text>
                  </Center>
                )}
              </Box>
            </TabPanel>
            <TabPanel>
              <Box>
              <HStack justify="space-between" mb={6}>
                <Heading size="md" mb={6}>Statistiques de maintenance</Heading>
                <Button
                  leftIcon={<FaTools />}
                  colorScheme="blue"
                  onClick={() => navigate('/maintenance')}
                >
                  Gérer les maintenances
                </Button>
                </HStack>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
                  <Card>
                    <CardBody>
                      <Stat>
                        <StatLabel>Coût total</StatLabel>
                        <StatNumber color="blue.600">
                          {equipment.reduce((sum, eq) => 
                            sum + (eq.maintenanceHistory?.reduce((cost, m) => cost + m.cost, 0) || 0), 0
                          ).toLocaleString('fr-FR')} €
                        </StatNumber>
                        <StatHelpText>
                          Dépenses totales en maintenance
                        </StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>

                  <Card>
                    <CardBody>
                      <Stat>
                        <StatLabel>Nombre d'interventions</StatLabel>
                        <StatNumber color="green.600">
                          {equipment.reduce((sum, eq) => 
                            sum + (eq.maintenanceHistory?.length || 0), 0
                          )}
                        </StatNumber>
                        <StatHelpText>
                          Total des maintenances effectuées
                        </StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>

                  <Card>
                    <CardBody>
                      <Stat>
                        <StatLabel>Coût moyen</StatLabel>
                        <StatNumber color="purple.600">
                          {(() => {
                            const totalCost = equipment.reduce((sum, eq) => 
                              sum + (eq.maintenanceHistory?.reduce((cost, m) => cost + m.cost, 0) || 0), 0
                            );
                            const totalInterventions = equipment.reduce((sum, eq) => 
                              sum + (eq.maintenanceHistory?.length || 0), 0
                            );
                            return totalInterventions > 0 
                              ? (totalCost / totalInterventions).toLocaleString('fr-FR')
                              : '0';
                          })()} €
                        </StatNumber>
                        <StatHelpText>
                          Coût moyen par intervention
                        </StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>

                  <Card>
                    <CardBody>
                      <Stat>
                        <StatLabel>Dernière maintenance</StatLabel>
                        <StatNumber color="orange.600">
                          {(() => {
                            const lastMaintenance = equipment
                              .flatMap(eq => eq.maintenanceHistory || [])
                              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
                            return lastMaintenance ? new Date(lastMaintenance.date).toLocaleDateString('fr-FR') : 'Aucune';
                          })()}
                        </StatNumber>
                        <StatHelpText>
                          Date de la dernière intervention
                        </StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>
                </SimpleGrid>

                <Heading size="md" mb={6}>Historique des maintenances</Heading>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Équipement</Th>
                      <Th>Date</Th>
                      <Th>Description</Th>
                      <Th>Coût</Th>
                      <Th>Technicien</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {equipment.flatMap(eq => 
                      eq.maintenanceHistory?.map((maintenance, index) => (
                        <Tr key={`${eq.id}-${index}`}>
                          <Td>{eq.name}</Td>
                          <Td>{new Date(maintenance.date).toLocaleDateString('fr-FR')}</Td>
                          <Td>{maintenance.description}</Td>
                          <Td>{maintenance.cost.toLocaleString('fr-FR')} €</Td>
                          <Td>{maintenance.performedBy}</Td>
                        </Tr>
                      ))
                    )}
                  </Tbody>
                </Table>
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>

      {/* Modal d'ajout d'équipement */}
      <Modal isOpen={isAddEquipmentOpen} onClose={onAddEquipmentClose} size="6xl">
        <ModalOverlay 
          backdropFilter="blur(12px)" 
          bg="blackAlpha.600" 
          transition="all 0.4s"
        />
        <ModalContent 
          borderRadius="3xl" 
          boxShadow="3xl" 
          overflow="hidden" 
          maxW="90vw"
          bg="white"
          border="1px solid"
          borderColor="gray.200"
          transition="all 0.4s"
          _hover={{ transform: "translateY(-3px)", boxShadow: "4xl" }}
        >
          <ModalHeader 
            py={8} 
            px={8}
            bg="#10B981"
            position="relative"
            _before={{
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bg: "blackAlpha.200",
              zIndex: 0
            }}
          >
            <ModalCloseButton 
              color="white" 
              size="lg"
              _hover={{ bg: "whiteAlpha.300" }}
              transition="all 0.2s"
            />
            <VStack align="start" spacing={2} position="relative" zIndex={1}>
              <Heading 
                size="xl" 
                color="white" 
                fontWeight="bold"
                letterSpacing="tight"
                textShadow="0 2px 4px rgba(0,0,0,0.2)"
              >
                Ajouter un nouvel équipement
              </Heading>
              <Text 
                color="whiteAlpha.900" 
                fontSize="lg"
                fontWeight="medium"
                textShadow="0 1px 2px rgba(0,0,0,0.1)"
              >
                Remplissez les informations pour ajouter un nouvel équipement à votre catalogue
              </Text>
            </VStack>
          </ModalHeader>

          <ModalBody p={8}>
            <VStack spacing={8} align="stretch">
              {/* Informations générales */}
              <Card 
                variant="outline" 
                p={8} 
                borderRadius="2xl" 
                boxShadow="xl" 
                borderColor="gray.200"
                transition="all 0.3s"
                _hover={{ transform: "translateY(-2px)", boxShadow: "2xl" }}
              >
                <Heading size="md" mb={6} color="indigo.600" fontWeight="semibold">
                  <HStack>
                    <Box as="span" color="indigo.500" mr={2}>●</Box>
                    Informations générales
                  </HStack>
                </Heading>
                <VStack spacing={6}>
                  <FormControl isInvalid={!!formErrors.name}>
                    <FormLabel fontWeight="medium" color="gray.700">Nom de l'équipement</FormLabel>
                    <Input
                      value={equipmentForm.name}
                      onChange={(e) => handleEquipmentFormChange('name', e.target.value)}
                      placeholder="Nom de l'équipement"
                      size="lg"
                      bg="white"
                      borderColor="gray.300"
                      _hover={{ borderColor: 'indigo.400' }}
                      _focus={{ borderColor: 'indigo.500', boxShadow: '0 0 0 1px #5B21B6' }}
                      transition="all 0.2s"
                    />
                    <FormErrorMessage>{formErrors.name}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={!!formErrors.category}>
                    <FormLabel fontWeight="medium" color="gray.700">Catégorie</FormLabel>
                    <Select
                      value={equipmentForm.category}
                      onChange={(e) => handleEquipmentFormChange('category', e.target.value)}
                      placeholder="Sélectionner une catégorie"
                      size="lg"
                      bg="white"
                      borderColor="gray.300"
                      _hover={{ borderColor: 'indigo.400' }}
                      _focus={{ borderColor: 'indigo.500', boxShadow: '0 0 0 1px #5B21B6' }}
                      transition="all 0.2s"
                    >
                      <option value="OUTILLAGE">Outillage</option>
                      <option value="MATERIEL">Matériel</option>
                      <option value="VEHICULE">Véhicule</option>
                      <option value="AUTRE">Autre</option>
                    </Select>
                    <FormErrorMessage>{formErrors.category}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={!!formErrors.price}>
                    <FormLabel fontWeight="medium" color="gray.700">Prix par jour (€)</FormLabel>
                    <NumberInput
                      value={equipmentForm.price}
                      onChange={(value) => handleEquipmentFormChange('price', Number(value))}
                      min={0}
                      size="lg"
                    >
                      <NumberInputField 
                        bg="white"
                        borderColor="gray.300"
                        _hover={{ borderColor: 'indigo.400' }}
                        _focus={{ borderColor: 'indigo.500', boxShadow: '0 0 0 1px #5B21B6' }}
                        transition="all 0.2s"
                      />
                    </NumberInput>
                    <FormErrorMessage>{formErrors.price}</FormErrorMessage>
                  </FormControl>
                </VStack>
              </Card>

              {/* Spécifications techniques */}
              <Card 
                variant="outline" 
                p={8} 
                borderRadius="2xl" 
                boxShadow="xl" 
                borderColor="gray.200"
                transition="all 0.3s"
                _hover={{ transform: "translateY(-2px)", boxShadow: "2xl" }}
              >
                <Heading size="md" mb={6} color="indigo.600" fontWeight="semibold">
                  <HStack>
                    <Box as="span" color="indigo.500" mr={2}>●</Box>
                    Spécifications techniques
                  </HStack>
                </Heading>
                <SimpleGrid columns={2} spacing={6}>
                  <FormControl>
                    <FormLabel fontWeight="medium" color="gray.700">Marque</FormLabel>
                    <Input
                      value={equipmentForm.specifications?.brand || ''}
                      onChange={(e) => handleEquipmentFormChange('specifications', {
                        ...equipmentForm.specifications,
                        brand: e.target.value
                      })}
                      placeholder="Marque de l'équipement"
                      size="lg"
                      bg="white"
                      borderColor="gray.300"
                      _hover={{ borderColor: 'indigo.400' }}
                      _focus={{ borderColor: 'indigo.500', boxShadow: '0 0 0 1px #5B21B6' }}
                      transition="all 0.2s"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontWeight="medium" color="gray.700">Modèle</FormLabel>
                    <Input
                      value={equipmentForm.specifications?.model || ''}
                      onChange={(e) => handleEquipmentFormChange('specifications', {
                        ...equipmentForm.specifications,
                        model: e.target.value
                      })}
                      placeholder="Modèle de l'équipement"
                      size="lg"
                      bg="white"
                      borderColor="gray.300"
                      _hover={{ borderColor: 'indigo.400' }}
                      _focus={{ borderColor: 'indigo.500', boxShadow: '0 0 0 1px #5B21B6' }}
                      transition="all 0.2s"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontWeight="medium" color="gray.700">Année</FormLabel>
                    <Input
                      value={equipmentForm.specifications?.year || ''}
                      onChange={(e) => handleEquipmentFormChange('specifications', {
                        ...equipmentForm.specifications,
                        year: e.target.value
                      })}
                      placeholder="Année de fabrication"
                      size="lg"
                      bg="white"
                      borderColor="gray.300"
                      _hover={{ borderColor: 'indigo.400' }}
                      _focus={{ borderColor: 'indigo.500', boxShadow: '0 0 0 1px #5B21B6' }}
                      transition="all 0.2s"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontWeight="medium" color="gray.700">Poids (kg)</FormLabel>
                    <Input
                      value={equipmentForm.specifications?.weight || ''}
                      onChange={(e) => handleEquipmentFormChange('specifications', {
                        ...equipmentForm.specifications,
                        weight: e.target.value
                      })}
                      placeholder="Poids en kg"
                      size="lg"
                      bg="white"
                      borderColor="gray.300"
                      _hover={{ borderColor: 'indigo.400' }}
                      _focus={{ borderColor: 'indigo.500', boxShadow: '0 0 0 1px #5B21B6' }}
                      transition="all 0.2s"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontWeight="medium" color="gray.700">Puissance (ch)</FormLabel>
                    <Input
                      value={equipmentForm.specifications?.power || ''}
                      onChange={(e) => handleEquipmentFormChange('specifications', {
                        ...equipmentForm.specifications,
                        power: e.target.value
                      })}
                      placeholder="Puissance en chevaux"
                      size="lg"
                      bg="white"
                      borderColor="gray.300"
                      _hover={{ borderColor: 'indigo.400' }}
                      _focus={{ borderColor: 'indigo.500', boxShadow: '0 0 0 1px #5B21B6' }}
                      transition="all 0.2s"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontWeight="medium" color="gray.700">Dimensions (L x l x h)</FormLabel>
                    <Input
                      value={equipmentForm.specifications?.dimensions || ''}
                      onChange={(e) => handleEquipmentFormChange('specifications', {
                        ...equipmentForm.specifications,
                        dimensions: e.target.value
                      })}
                      placeholder="Dimensions en mètres"
                      size="lg"
                      bg="white"
                      borderColor="gray.300"
                      _hover={{ borderColor: 'indigo.400' }}
                      _focus={{ borderColor: 'indigo.500', boxShadow: '0 0 0 1px #5B21B6' }}
                      transition="all 0.2s"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontWeight="medium" color="gray.700">Capacité</FormLabel>
                    <Input
                      value={equipmentForm.specifications?.capacity || ''}
                      onChange={(e) => handleEquipmentFormChange('specifications', {
                        ...equipmentForm.specifications,
                        capacity: e.target.value
                      })}
                      placeholder="Capacité de l'équipement"
                      size="lg"
                      bg="white"
                      borderColor="gray.300"
                      _hover={{ borderColor: 'indigo.400' }}
                      _focus={{ borderColor: 'indigo.500', boxShadow: '0 0 0 1px #5B21B6' }}
                      transition="all 0.2s"
                    />
                  </FormControl>
                </SimpleGrid>
              </Card>

              {/* Description */}
              <Card 
                variant="outline" 
                p={8} 
                borderRadius="2xl" 
                boxShadow="xl" 
                borderColor="gray.200"
                transition="all 0.3s"
                _hover={{ transform: "translateY(-2px)", boxShadow: "2xl" }}
              >
                <Heading size="md" mb={6} color="indigo.600" fontWeight="semibold">
                  <HStack>
                    <Box as="span" color="indigo.500" mr={2}>●</Box>
                    Description
                  </HStack>
                </Heading>
                <FormControl>
                  <FormLabel fontWeight="medium" color="gray.700">Description détaillée</FormLabel>
                  <Textarea
                    value={equipmentForm.description}
                    onChange={(e) => handleEquipmentFormChange('description', e.target.value)}
                    placeholder="Description détaillée de l'équipement"
                    size="lg"
                    minH="150px"
                    bg="white"
                    borderColor="gray.300"
                    _hover={{ borderColor: 'indigo.400' }}
                    _focus={{ borderColor: 'indigo.500', boxShadow: '0 0 0 1px #5B21B6' }}
                    transition="all 0.2s"
                  />
                </FormControl>
              </Card>

              {/* Historique de maintenance */}
              <Card 
                variant="outline" 
                p={8} 
                borderRadius="2xl" 
                boxShadow="xl" 
                borderColor="gray.200"
                transition="all 0.3s"
                _hover={{ transform: "translateY(-2px)", boxShadow: "2xl" }}
              >
                <HStack justify="space-between" mb={6}>
                  <Heading size="md" color="indigo.600" fontWeight="semibold">
                    <HStack>
                      <Box as="span" color="indigo.500" mr={2}>●</Box>
                      Historique de maintenance
                    </HStack>
                  </Heading>
                  <Button
                    leftIcon={<FaPlus />}
                    colorScheme="indigo"
                    onClick={handleMaintenanceAdd}
                    size="md"
                    borderRadius="full"
                    boxShadow="md"
                    _hover={{ transform: "translateY(-1px)", boxShadow: "lg" }}
                    transition="all 0.2s"
                  >
                    Ajouter une maintenance
                  </Button>
                </HStack>
                <VStack spacing={6}>
                  {equipmentForm.maintenanceHistory?.map((maintenance, index) => (
                    <Card 
                      key={index} 
                      variant="outline" 
                      p={6} 
                      borderRadius="xl" 
                      w="100%" 
                      borderColor="gray.200"
                      transition="all 0.3s"
                      _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
                    >
                      <HStack justify="space-between" mb={4}>
                        <Heading size="sm" color="gray.700">Maintenance #{index + 1}</Heading>
                        <IconButton
                          aria-label="Supprimer la maintenance"
                          icon={<FaTrash />}
                          colorScheme="red"
                          variant="ghost"
                          onClick={() => handleMaintenanceRemove(index)}
                          borderRadius="full"
                          _hover={{ bg: "red.50" }}
                          transition="all 0.2s"
                        />
                      </HStack>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                        <FormControl>
                          <FormLabel fontWeight="medium" color="gray.700">Date</FormLabel>
                          <Input
                            type="date"
                            value={maintenance.date.split('T')[0]}
                            onChange={(e) => handleMaintenanceChange(index, 'date', e.target.value)}
                            size="lg"
                            bg="white"
                            borderColor="gray.300"
                            _hover={{ borderColor: 'indigo.400' }}
                            _focus={{ borderColor: 'indigo.500', boxShadow: '0 0 0 1px #5B21B6' }}
                            transition="all 0.2s"
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel fontWeight="medium" color="gray.700">Coût (€)</FormLabel>
                          <NumberInput
                            value={maintenance.cost}
                            onChange={(value) => handleMaintenanceChange(index, 'cost', Number(value))}
                            min={0}
                            size="lg"
                          >
                            <NumberInputField 
                              bg="white"
                              borderColor="gray.300"
                              _hover={{ borderColor: 'indigo.400' }}
                              _focus={{ borderColor: 'indigo.500', boxShadow: '0 0 0 1px #5B21B6' }}
                              transition="all 0.2s"
                            />
                          </NumberInput>
                        </FormControl>
                        <FormControl>
                          <FormLabel fontWeight="medium" color="gray.700">Effectué par</FormLabel>
                          <Input
                            value={maintenance.performedBy}
                            onChange={(e) => handleMaintenanceChange(index, 'performedBy', e.target.value)}
                            placeholder="Nom du technicien"
                            size="lg"
                            bg="white"
                            borderColor="gray.300"
                            _hover={{ borderColor: 'indigo.400' }}
                            _focus={{ borderColor: 'indigo.500', boxShadow: '0 0 0 1px #5B21B6' }}
                            transition="all 0.2s"
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel fontWeight="medium" color="gray.700">Description</FormLabel>
                          <Textarea
                            value={maintenance.description}
                            onChange={(e) => handleMaintenanceChange(index, 'description', e.target.value)}
                            placeholder="Description des travaux effectués"
                            size="lg"
                            minH="100px"
                            bg="white"
                            borderColor="gray.300"
                            _hover={{ borderColor: 'indigo.400' }}
                            _focus={{ borderColor: 'indigo.500', boxShadow: '0 0 0 1px #5B21B6' }}
                            transition="all 0.2s"
                          />
                        </FormControl>
                      </SimpleGrid>
                    </Card>
                  ))}
                </VStack>
              </Card>
            </VStack>
          </ModalBody>
          <ModalFooter 
            borderTopWidth="1px" 
            py={6} 
            px={8}
            bg="gray.50"
          >
            <HStack spacing={4}>
              <Button 
                variant="outline" 
                onClick={onAddEquipmentClose}
                size="lg"
                borderRadius="full"
                borderColor="gray.300"
                color="gray.700"
                bg="white"
                _hover={{ bg: "gray.100" }}
                transition="all 0.2s"
              >
                Annuler
              </Button>
              <Button
                onClick={handleAddEquipment}
                leftIcon={<FaSave />}
                size="lg"
                borderRadius="full"
                bg="#10B981"
                color="white"
                fontWeight="bold"
                letterSpacing="wide"
                boxShadow="0 4px 12px rgba(16, 185, 129, 0.3)"
                _hover={{ 
                  bg: "#059669",
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 16px rgba(16, 185, 129, 0.4)"
                }}
                _active={{
                  transform: "translateY(0)",
                  boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)"
                }}
                transition="all 0.2s"
              >
                Enregistrer
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal d'édition d'équipement */}
      <Modal isOpen={isEditEquipmentOpen} onClose={onEditEquipmentClose} size="6xl">
        <ModalOverlay 
          backdropFilter="blur(12px)" 
          bg="blackAlpha.500" 
          transition="all 0.4s"
        />
        <ModalContent 
          borderRadius="3xl" 
          boxShadow="3xl" 
          overflow="hidden" 
          maxW="90vw"
          bg="gray.50"
          border="1px solid"
          borderColor="gray.200"
          transition="all 0.4s"
          _hover={{ transform: "translateY(-3px)", boxShadow: "4xl" }}
        >
          <ModalHeader 
            borderBottomWidth="1px" 
            py={10}
            bg="#10B981" 
            color="white"
            position="relative"
            overflow="hidden"
            _before={{
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "linear-gradient(45deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%)",
              zIndex: 1
            }}
            _after={{
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "radial-gradient(circle at top right, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 60%)",
              zIndex: 1
            }}
          >
            <VStack align="start" spacing={3} position="relative" zIndex={2}>
              <Heading 
                size="xl" 
                fontWeight="bold" 
                letterSpacing="tight"
                color="white"
              >
                Modifier l'équipement
              </Heading>
              <Text 
                fontSize="lg" 
                color="whiteAlpha.900" 
                fontWeight="medium"
                letterSpacing="wide"
                sx={{
                  textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                }}
              >
                Gérez les détails et la disponibilité de votre équipement
              </Text>
            </VStack>
          </ModalHeader>
          <ModalCloseButton 
            color="white" 
            bg="whiteAlpha.300"
            borderRadius="full"
            _hover={{ bg: "whiteAlpha.400", transform: "rotate(90deg)" }}
            transition="all 0.3s"
            size="lg"
            top={8}
            right={8}
          />
          <ModalBody py={10}>
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={10}>
              {/* Colonne de gauche */}
              <VStack spacing={10} align="stretch">
                {/* Informations générales */}
                <Card 
                  variant="outline" 
                  p={8} 
                  borderRadius="2xl" 
                  boxShadow="xl" 
                  borderColor="gray.200"
                  transition="all 0.3s"
                  _hover={{ transform: "translateY(-3px)", boxShadow: "2xl" }}
                  bg="white"
                >
                  <Heading size="md" mb={8} color="indigo.600" fontWeight="semibold">
                    <HStack spacing={3}>
                      <Box as="span" color="indigo.500" fontSize="lg">●</Box>
                      <Text>Informations générales</Text>
                    </HStack>
                  </Heading>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    <FormControl isInvalid={!!formErrors.name}>
                      <FormLabel fontWeight="semibold" color="gray.700">Nom</FormLabel>
                      <Input
                        value={equipmentForm.name}
                        onChange={(e) => handleEquipmentFormChange('name', e.target.value)}
                        placeholder="Nom de l'équipement"
                        size="lg"
                        bg="white"
                        borderColor="gray.300"
                        _hover={{ borderColor: 'indigo.400' }}
                        _focus={{ borderColor: 'indigo.500', boxShadow: '0 0 0 1px #6366f1' }}
                        transition="all 0.2s"
                      />
                      <FormErrorMessage>{formErrors.name}</FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={!!formErrors.category}>
                      <FormLabel fontWeight="semibold" color="gray.700">Catégorie</FormLabel>
                      <Select
                        value={equipmentForm.category}
                        onChange={(e) => handleEquipmentFormChange('category', e.target.value)}
                        placeholder="Sélectionner une catégorie"
                        size="lg"
                        bg="white"
                        borderColor="gray.300"
                        _hover={{ borderColor: 'indigo.400' }}
                        _focus={{ borderColor: 'indigo.500', boxShadow: '0 0 0 1px #6366f1' }}
                        transition="all 0.2s"
                      >
                        <option value="OUTILLAGE">Outillage</option>
                        <option value="MATERIEL">Matériel</option>
                        <option value="VEHICULE">Véhicule</option>
                        <option value="AUTRE">Autre</option>
                      </Select>
                      <FormErrorMessage>{formErrors.category}</FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={!!formErrors.price}>
                      <FormLabel fontWeight="semibold" color="gray.700">Prix par jour (€)</FormLabel>
                      <NumberInput
                        value={equipmentForm.price}
                        onChange={(value) => handleEquipmentFormChange('price', Number(value))}
                        min={0}
                        size="lg"
                      >
                        <NumberInputField 
                          bg="white"
                          borderColor="gray.300"
                          _hover={{ borderColor: 'indigo.400' }}
                          _focus={{ borderColor: 'indigo.500', boxShadow: '0 0 0 1px #6366f1' }}
                          transition="all 0.2s"
                        />
                      </NumberInput>
                      <FormErrorMessage>{formErrors.price}</FormErrorMessage>
                    </FormControl>

                    <FormControl>
                      <FormLabel fontWeight="semibold" color="gray.700">Localisation</FormLabel>
                      <Input
                        value={equipmentForm.location}
                        onChange={(e) => handleEquipmentFormChange('location', e.target.value)}
                        placeholder="Adresse de l'équipement"
                        size="lg"
                        bg="white"
                        borderColor="gray.300"
                        _hover={{ borderColor: 'indigo.400' }}
                        _focus={{ borderColor: 'indigo.500', boxShadow: '0 0 0 1px #6366f1' }}
                        transition="all 0.2s"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontWeight="semibold" color="gray.700">Caution (€)</FormLabel>
                      <NumberInput
                        value={equipmentForm.depositAmount}
                        onChange={(value) => handleEquipmentFormChange('depositAmount', Number(value))}
                        min={0}
                        size="lg"
                      >
                        <NumberInputField 
                          bg="white"
                          borderColor="gray.300"
                          _hover={{ borderColor: 'indigo.400' }}
                          _focus={{ borderColor: 'indigo.500', boxShadow: '0 0 0 1px #6366f1' }}
                          transition="all 0.2s"
                        />
                      </NumberInput>
                    </FormControl>

                    <FormControl>
                      <FormLabel fontWeight="semibold" color="gray.700">Période de location minimum (jours)</FormLabel>
                      <NumberInput
                        value={equipmentForm.minimumRentalPeriod}
                        onChange={(value) => handleEquipmentFormChange('minimumRentalPeriod', Number(value))}
                        min={1}
                        size="lg"
                      >
                        <NumberInputField 
                          bg="white"
                          borderColor="gray.300"
                          _hover={{ borderColor: 'indigo.400' }}
                          _focus={{ borderColor: 'indigo.500', boxShadow: '0 0 0 1px #6366f1' }}
                          transition="all 0.2s"
                        />
                      </NumberInput>
                    </FormControl>
                  </SimpleGrid>
                </Card>

                {/* Spécifications techniques */}
                <Card 
                  variant="outline" 
                  p={8} 
                  borderRadius="2xl" 
                  boxShadow="xl" 
                  borderColor="gray.200"
                  transition="all 0.3s"
                  _hover={{ transform: "translateY(-3px)", boxShadow: "2xl" }}
                  bg="white"
                >
                  <Heading size="md" mb={8} color="violet.600" fontWeight="semibold">
                    <HStack spacing={3}>
                      <Box as="span" color="violet.500" fontSize="lg">●</Box>
                      <Text>Spécifications techniques</Text>
                    </HStack>
                  </Heading>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    <FormControl>
                      <FormLabel fontWeight="semibold" color="gray.700">Marque</FormLabel>
                      <Input
                        value={equipmentForm.specifications?.brand || ''}
                        onChange={(e) => handleEquipmentFormChange('specifications', {
                          ...equipmentForm.specifications,
                          brand: e.target.value
                        })}
                        placeholder="Marque de l'équipement"
                        size="lg"
                        bg="white"
                        borderColor="gray.300"
                        _hover={{ borderColor: 'violet.400' }}
                        _focus={{ borderColor: 'violet.500', boxShadow: '0 0 0 1px #8b5cf6' }}
                        transition="all 0.2s"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontWeight="semibold" color="gray.700">Modèle</FormLabel>
                      <Input
                        value={equipmentForm.specifications?.model || ''}
                        onChange={(e) => handleEquipmentFormChange('specifications', {
                          ...equipmentForm.specifications,
                          model: e.target.value
                        })}
                        placeholder="Modèle de l'équipement"
                        size="lg"
                        bg="white"
                        borderColor="gray.300"
                        _hover={{ borderColor: 'violet.400' }}
                        _focus={{ borderColor: 'violet.500', boxShadow: '0 0 0 1px #8b5cf6' }}
                        transition="all 0.2s"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontWeight="semibold" color="gray.700">Année</FormLabel>
                      <Input
                        value={equipmentForm.specifications?.year || ''}
                        onChange={(e) => handleEquipmentFormChange('specifications', {
                          ...equipmentForm.specifications,
                          year: e.target.value
                        })}
                        placeholder="Année de fabrication"
                        size="lg"
                        bg="white"
                        borderColor="gray.300"
                        _hover={{ borderColor: 'violet.400' }}
                        _focus={{ borderColor: 'violet.500', boxShadow: '0 0 0 1px #8b5cf6' }}
                        transition="all 0.2s"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontWeight="semibold" color="gray.700">Poids (kg)</FormLabel>
                      <Input
                        value={equipmentForm.specifications?.weight || ''}
                        onChange={(e) => handleEquipmentFormChange('specifications', {
                          ...equipmentForm.specifications,
                          weight: e.target.value
                        })}
                        placeholder="Poids en kg"
                        size="lg"
                        bg="white"
                        borderColor="gray.300"
                        _hover={{ borderColor: 'violet.400' }}
                        _focus={{ borderColor: 'violet.500', boxShadow: '0 0 0 1px #8b5cf6' }}
                        transition="all 0.2s"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontWeight="semibold" color="gray.700">Puissance (ch)</FormLabel>
                      <Input
                        value={equipmentForm.specifications?.power || ''}
                        onChange={(e) => handleEquipmentFormChange('specifications', {
                          ...equipmentForm.specifications,
                          power: e.target.value
                        })}
                        placeholder="Puissance en chevaux"
                        size="lg"
                        bg="white"
                        borderColor="gray.300"
                        _hover={{ borderColor: 'violet.400' }}
                        _focus={{ borderColor: 'violet.500', boxShadow: '0 0 0 1px #8b5cf6' }}
                        transition="all 0.2s"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontWeight="semibold" color="gray.700">Dimensions (L x l x h)</FormLabel>
                      <Input
                        value={equipmentForm.specifications?.dimensions || ''}
                        onChange={(e) => handleEquipmentFormChange('specifications', {
                          ...equipmentForm.specifications,
                          dimensions: e.target.value
                        })}
                        placeholder="Dimensions en mètres"
                        size="lg"
                        bg="white"
                        borderColor="gray.300"
                        _hover={{ borderColor: 'violet.400' }}
                        _focus={{ borderColor: 'violet.500', boxShadow: '0 0 0 1px #8b5cf6' }}
                        transition="all 0.2s"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontWeight="semibold" color="gray.700">Capacité</FormLabel>
                      <Input
                        value={equipmentForm.specifications?.capacity || ''}
                        onChange={(e) => handleEquipmentFormChange('specifications', {
                          ...equipmentForm.specifications,
                          capacity: e.target.value
                        })}
                        placeholder="Capacité de l'équipement"
                        size="lg"
                        bg="white"
                        borderColor="gray.300"
                        _hover={{ borderColor: 'violet.400' }}
                        _focus={{ borderColor: 'violet.500', boxShadow: '0 0 0 1px #8b5cf6' }}
                        transition="all 0.2s"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontWeight="semibold" color="gray.700">Type de moteur</FormLabel>
                      <Input
                        value={equipmentForm.specifications?.engineType || ''}
                        onChange={(e) => handleEquipmentFormChange('specifications', {
                          ...equipmentForm.specifications,
                          engineType: e.target.value
                        })}
                        placeholder="Type de moteur"
                        size="lg"
                        bg="white"
                        borderColor="gray.300"
                        _hover={{ borderColor: 'violet.400' }}
                        _focus={{ borderColor: 'violet.500', boxShadow: '0 0 0 1px #8b5cf6' }}
                        transition="all 0.2s"
                      />
                    </FormControl>
                  </SimpleGrid>
                </Card>
              </VStack>

              {/* Colonne de droite */}
              <VStack spacing={10} align="stretch">
                {/* Description */}
                <Card 
                  variant="outline" 
                  p={8} 
                  borderRadius="2xl" 
                  boxShadow="xl" 
                  borderColor="gray.200"
                  transition="all 0.3s"
                  _hover={{ transform: "translateY(-3px)", boxShadow: "2xl" }}
                  bg="white"
                >
                  <Heading size="md" mb={8} color="purple.600" fontWeight="semibold">
                    <HStack spacing={3}>
                      <Box as="span" color="purple.500" fontSize="lg">●</Box>
                      <Text>Description</Text>
                    </HStack>
                  </Heading>
                  <FormControl>
                    <FormLabel fontWeight="semibold" color="gray.700">Description détaillée</FormLabel>
                    <Textarea
                      value={equipmentForm.description}
                      onChange={(e) => handleEquipmentFormChange('description', e.target.value)}
                      placeholder="Description détaillée de l'équipement"
                      size="lg"
                      minH="200px"
                      bg="white"
                      borderColor="gray.300"
                      _hover={{ borderColor: 'purple.400' }}
                      _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px #9333ea' }}
                      transition="all 0.2s"
                    />
                  </FormControl>
                </Card>

                {/* Disponibilité */}
                <Card 
                  variant="outline" 
                  p={8} 
                  borderRadius="2xl" 
                  boxShadow="xl" 
                  borderColor="gray.200"
                  transition="all 0.3s"
                  _hover={{ transform: "translateY(-3px)", boxShadow: "2xl" }}
                  bg="white"
                >
                  <Heading size="md" mb={8} color="green.600" fontWeight="semibold">
                    <HStack spacing={3}>
                      <Box as="span" color="green.500" fontSize="lg">●</Box>
                      <Text>Disponibilité</Text>
                    </HStack>
                  </Heading>
                  <VStack spacing={6} align="stretch">
                    <FormControl display="flex" alignItems="center">
                      <FormLabel mb="0" fontWeight="semibold" color="gray.700">Disponible</FormLabel>
                      <Switch
                        isChecked={equipmentForm.isAvailable}
                        onChange={(e) => handleEquipmentFormChange('isAvailable', e.target.checked)}
                        colorScheme="green"
                        size="lg"
                      />
                    </FormControl>

                    <Box>
                      <Text mb={4} fontWeight="semibold" color="gray.700">Calendrier des disponibilités</Text>
                      <Calendar
                        localizer={localizer}
                        events={availabilityEvents}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: 400, width: '100%', minWidth: '100%' }}
                        views={['month']}
                        onSelectEvent={handleRemoveAvailability}
                        onSelectSlot={({ start }) => handleAvailabilityChange(start)}
                        selectable
                        eventPropGetter={(event) => ({
                          style: {
                            backgroundColor: event.type === 'available' ? '#48BB78' : '#F56565',
                            borderRadius: '4px',
                            opacity: 0.8,
                            color: 'white',
                            border: '0px',
                            display: 'block'
                          }
                        })}
                      />
                    </Box>
                  </VStack>
                </Card>

                {/* Statistiques de maintenance */}
                <Card 
                  variant="outline" 
                  p={8} 
                  borderRadius="2xl" 
                  boxShadow="xl" 
                  borderColor="gray.200"
                  transition="all 0.3s"
                  _hover={{ transform: "translateY(-3px)", boxShadow: "2xl" }}
                  bg="white"
                  mb={8}
                >
                  <HStack justify="space-between" mb={6}>
                    <Heading size="md" color="blue.600" fontWeight="semibold">
                      <HStack spacing={3}>
                        <Box as="span" color="blue.500" fontSize="lg">●</Box>
                        <Text>Statistiques de maintenance</Text>
                      </HStack>
                    </Heading>
                    
                  </HStack>
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
                    <Stat
                      px={4}
                      py={5}
                      shadow="xl"
                      borderColor="gray.200"
                      rounded="lg"
                      bg="white"
                      transition="all 0.3s"
                      _hover={{ transform: "translateY(-2px)", shadow: "2xl" }}
                    >
                      <StatLabel fontWeight="medium" color="gray.600">Coût total</StatLabel>
                      <StatNumber color="blue.600" fontSize="2xl">
                        {equipmentForm.maintenanceHistory?.reduce((sum, m) => sum + m.cost, 0).toLocaleString('fr-FR')} €
                      </StatNumber>
                      <StatHelpText color="gray.500">
                        Dépenses totales en maintenance
                      </StatHelpText>
                    </Stat>
                    <Stat
                      px={4}
                      py={5}
                      shadow="xl"
                      borderColor="gray.200"
                      rounded="lg"
                      bg="white"
                      transition="all 0.3s"
                      _hover={{ transform: "translateY(-2px)", shadow: "2xl" }}
                    >
                      <StatLabel fontWeight="medium" color="gray.600">Nombre d'interventions</StatLabel>
                      <StatNumber color="green.600" fontSize="2xl">
                        {equipmentForm.maintenanceHistory?.length || 0}
                      </StatNumber>
                      <StatHelpText color="gray.500">
                        Total des maintenances effectuées
                      </StatHelpText>
                    </Stat>
                    <Stat
                      px={4}
                      py={5}
                      shadow="xl"
                      borderColor="gray.200"
                      rounded="lg"
                      bg="white"
                      transition="all 0.3s"
                      _hover={{ transform: "translateY(-2px)", shadow: "2xl" }}
                    >
                      <StatLabel fontWeight="medium" color="gray.600">Coût moyen</StatLabel>
                      <StatNumber color="purple.600" fontSize="2xl">
                        {equipmentForm.maintenanceHistory?.length 
                          ? (equipmentForm.maintenanceHistory.reduce((sum, m) => sum + m.cost, 0) / equipmentForm.maintenanceHistory.length).toLocaleString('fr-FR')
                          : '0'} €
                      </StatNumber>
                      <StatHelpText color="gray.500">
                        Coût moyen par intervention
                      </StatHelpText>
                    </Stat>
                    <Stat
                      px={4}
                      py={5}
                      shadow="xl"
                      borderColor="gray.200"
                      rounded="lg"
                      bg="white"
                      transition="all 0.3s"
                      _hover={{ transform: "translateY(-2px)", shadow: "2xl" }}
                    >
                      <StatLabel fontWeight="medium" color="gray.600">Dernière maintenance</StatLabel>
                      <StatNumber color="orange.600" fontSize="2xl">
                        {equipmentForm.maintenanceHistory?.length 
                          ? new Date(equipmentForm.maintenanceHistory[equipmentForm.maintenanceHistory.length - 1].date).toLocaleDateString('fr-FR')
                          : 'Aucune'}
                      </StatNumber>
                      <StatHelpText color="gray.500">
                        Date de la dernière intervention
                      </StatHelpText>
                    </Stat>
                  </SimpleGrid>
                </Card>

                {/* Historique de maintenance */}
                <Card 
                  variant="outline" 
                  p={8} 
                  borderRadius="2xl" 
                  boxShadow="xl" 
                  borderColor="gray.200"
                  transition="all 0.3s"
                  _hover={{ transform: "translateY(-3px)", boxShadow: "2xl" }}
                  bg="white"
                >
                  <Heading size="md" color="orange.600" fontWeight="semibold" mb={8}>
                    <HStack spacing={3}>
                      <Box as="span" color="orange.500" fontSize="lg">●</Box>
                      <Text>Historique de maintenance</Text>
                    </HStack>
                  </Heading>
                  <VStack spacing={5}>
                    {equipmentForm.maintenanceHistory?.map((maintenance, index) => (
                      <Card 
                        key={index} 
                        variant="outline" 
                        p={6} 
                        borderRadius="xl" 
                        w="100%" 
                        borderColor="gray.200"
                        transition="all 0.3s"
                        _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
                        bg="white"
                      >
                        <HStack justify="space-between" mb={4}>
                          <Heading size="sm" color="gray.700">Maintenance #{index + 1}</Heading>
                          <IconButton
                            aria-label="Supprimer la maintenance"
                            icon={<FaTrash />}
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => handleMaintenanceRemove(index)}
                            borderRadius="full"
                            _hover={{ bg: "red.50" }}
                            transition="all 0.2s"
                          />
                        </HStack>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                          <FormControl>
                            <FormLabel fontWeight="semibold" color="gray.700">Date</FormLabel>
                            <Input
                              type="date"
                              value={maintenance.date.split('T')[0]}
                              onChange={(e) => handleMaintenanceChange(index, 'date', e.target.value)}
                              size="lg"
                              bg="white"
                              borderColor="gray.300"
                              _hover={{ borderColor: 'orange.400' }}
                              _focus={{ borderColor: 'orange.500', boxShadow: '0 0 0 1px #ed8936' }}
                              transition="all 0.2s"
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel fontWeight="semibold" color="gray.700">Coût (€)</FormLabel>
                            <NumberInput
                              value={maintenance.cost}
                              onChange={(value) => handleMaintenanceChange(index, 'cost', Number(value))}
                              min={0}
                              size="lg"
                            >
                              <NumberInputField 
                                bg="white"
                                borderColor="gray.300"
                                _hover={{ borderColor: 'orange.400' }}
                                _focus={{ borderColor: 'orange.500', boxShadow: '0 0 0 1px #ed8936' }}
                                transition="all 0.2s"
                              />
                            </NumberInput>
                          </FormControl>
                          <FormControl>
                            <FormLabel fontWeight="semibold" color="gray.700">Effectué par</FormLabel>
                            <Input
                              value={maintenance.performedBy}
                              onChange={(e) => handleMaintenanceChange(index, 'performedBy', e.target.value)}
                              placeholder="Nom du technicien"
                              size="lg"
                              bg="white"
                              borderColor="gray.300"
                              _hover={{ borderColor: 'orange.400' }}
                              _focus={{ borderColor: 'orange.500', boxShadow: '0 0 0 1px #ed8936' }}
                              transition="all 0.2s"
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel fontWeight="semibold" color="gray.700">Description</FormLabel>
                            <Textarea
                              value={maintenance.description}
                              onChange={(e) => handleMaintenanceChange(index, 'description', e.target.value)}
                              placeholder="Description des travaux effectués"
                              size="lg"
                              minH="100px"
                              bg="white"
                              borderColor="gray.300"
                              _hover={{ borderColor: 'orange.400' }}
                              _focus={{ borderColor: 'orange.500', boxShadow: '0 0 0 1px #ed8936' }}
                              transition="all 0.2s"
                            />
                          </FormControl>
                        </SimpleGrid>
                      </Card>
                    ))}
                  </VStack>
                </Card>
              </VStack>
            </SimpleGrid>
          </ModalBody>
          <ModalFooter 
            borderTopWidth="1px" 
            py={8} 
            px={8}
            bg="gray.50"
          >
            <HStack spacing={4}>
              <Button 
                variant="outline" 
                onClick={onEditEquipmentClose}
                size="lg"
                borderRadius="full"
                borderColor="gray.300"
                color="gray.700"
                bg="white"
                _hover={{ bg: "gray.100" }}
                transition="all 0.2s"
              >
                Annuler
              </Button>
              <Button
                onClick={handleEditEquipment}
                leftIcon={<FaSave />}
                size="lg"
                borderRadius="full"
                bg="#10B981"
                color="white"
                fontWeight="bold"
                letterSpacing="wide"
                boxShadow="0 4px 12px rgba(16, 185, 129, 0.3)"
                _hover={{ 
                  bg: "#059669",
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 16px rgba(16, 185, 129, 0.4)"
                }}
                _active={{
                  transform: "translateY(0)",
                  boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)"
                }}
                transition="all 0.2s"
              >
                Enregistrer
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default ProfessionalDashboard; 