import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Container,
  Box,
  Grid,
  GridItem,
  Button,
  Text,
  Heading,
  VStack,
  HStack,
  Image,
  IconButton,
  Tooltip,
  Spinner,
  Alert,
  AlertIcon,
  useColorModeValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  List,
  ListItem,
  Avatar,
  Badge,
  Divider,
  useBreakpointValue,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Input,
  Textarea,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Flex,
  AspectRatio,
  Tag,
  TagLabel,
  TagLeftIcon,
  TagRightIcon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  StatGroup,
  Wrap,
  WrapItem,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Center,
  Checkbox,
  SimpleGrid,
  ButtonGroup,
  Select,
  Switch,
} from '@chakra-ui/react';
import {
  FaCalendarAlt,
  FaEuroSign,
  FaTag,
  FaCheckCircle,
  FaTimesCircle,
  FaUser,
  FaStar,
  FaShare,
  FaHeart,
  FaRegHeart,
  FaMapMarkerAlt,
  FaTools,
  FaTachometerAlt,
  FaWeightHanging,
  FaRulerVertical,
  FaInfoCircle,
  FaArrowLeft,
  FaClock,
  FaShieldAlt,
  FaTruck,
  FaCog,
  FaCalendarCheck,
  FaCheck,
  FaHistory,
  FaEdit,
  FaTrash,
  FaPlus,
  FaChartLine,
  FaExclamationTriangle,
  FaTimes,
  FaSave,
} from 'react-icons/fa';
import { RootState } from '../store';
import { Equipment } from '../types';
import { createRentalRequest, getRentalRequestsByUser } from '../services/rentalService';
import { useNotification } from '../contexts/NotificationContext';
import * as availabilityService from '../services/availabilityService';
import * as equipmentService from '../services/equipmentService';
import * as rentalService from '../services/rentalService';

// Définition des animations
const fadeInStyle = {
  animation: 'fadeIn 0.5s ease-out forwards',
  '@keyframes fadeIn': {
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' }
  }
};

const pulseStyle = {
  animation: 'pulse 2s infinite',
  '@keyframes pulse': {
    '0%': { transform: 'scale(1)' },
    '50%': { transform: 'scale(1.05)' },
    '100%': { transform: 'scale(1)' }
  }
};

const EquipmentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const toast = useToast();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const equipment = useSelector((state: RootState) =>
    state.equipment.items.find((item: Equipment) => item.id === id)
  );

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '',
    city: '',
    postalCode: '',
    country: 'France'
  });
  const [billingAddress, setBillingAddress] = useState({
    street: '',
    city: '',
    postalCode: '',
    country: 'France'
  });
  const [useDifferentDeliveryAddress, setUseDifferentDeliveryAddress] = useState(false);
  const [reviews] = useState([
    { id: 1, user: 'Jean Dupont', rating: 5, comment: 'Excellent équipement, très performant.', date: '2023-05-15' },
    { id: 2, user: 'Marie Martin', rating: 4, comment: 'Bon état général, quelques rayures mais rien de grave.', date: '2023-04-22' },
    { id: 3, user: 'Pierre Durand', rating: 3, comment: 'Fonctionne bien mais un peu bruyant.', date: '2023-03-10' },
  ]);
  const [availabilities, setAvailabilities] = useState<availabilityService.Availability[]>([]);
  const [loadingAvailabilities, setLoadingAvailabilities] = useState(true);
  const [rentalHistory, setRentalHistory] = useState<any[]>([]);
  const [equipmentData, setEquipmentData] = useState<Equipment | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Equipment>>({});
  const [maintenanceHistory, setMaintenanceHistory] = useState<any[]>([]);
  const [newMaintenance, setNewMaintenance] = useState({
    date: '',
    description: '',
    cost: 0,
    performedBy: ''
  });
  const { isOpen: isMaintenanceOpen, onOpen: onMaintenanceOpen, onClose: onMaintenanceClose } = useDisclosure();
  const [rentalRequests, setRentalRequests] = useState<any[]>([]);

  useEffect(() => {
    const loadAvailabilities = async () => {
      if (!id) {
        console.log('ID manquant pour charger les disponibilités');
        return;
      }
      
      try {
        console.log('Début du chargement des disponibilités pour l\'équipement:', id);
        setLoadingAvailabilities(true);
        let data = await availabilityService.getEquipmentAvailability(id);
        
        // Si aucune disponibilité n'existe, créer une disponibilité par défaut
        if (data.length === 0) {
          console.log('Aucune disponibilité trouvée, création d\'une disponibilité par défaut');
          const defaultAvailability = {
            equipmentId: id,
            startDate: new Date(),
            endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
            status: 'available' as const
          };
          await availabilityService.updateEquipmentAvailability(id, [defaultAvailability]);
          data = [defaultAvailability];
        }
        
        console.log('Données de disponibilité reçues:', data);
        setAvailabilities(data);
      } catch (error) {
        console.error('Erreur lors du chargement des disponibilités:', error);
        showNotification('Impossible de charger les disponibilités', 'error');
      } finally {
        setLoadingAvailabilities(false);
      }
    };

    loadAvailabilities();
  }, [id, showNotification]);

  // Pré-remplir les adresses avec les informations de l'utilisateur
  useEffect(() => {
    if (user) {
      // Pré-remplir l'adresse de livraison
      if (user.deliveryAddress) {
        setDeliveryAddress({
          street: user.deliveryAddress.street || '',
          city: user.deliveryAddress.city || '',
          postalCode: user.deliveryAddress.postalCode || '',
          country: user.deliveryAddress.country || 'France'
        });
      }
      
      // Pré-remplir l'adresse de facturation
      if (user.billingAddress) {
        setBillingAddress({
          street: user.billingAddress.street || '',
          city: user.billingAddress.city || '',
          postalCode: user.billingAddress.postalCode || '',
          country: user.billingAddress.country || 'France'
        });
        
        // Vérifier si les adresses sont différentes
        const addressesAreDifferent = user.deliveryAddress && user.billingAddress ? 
          (user.deliveryAddress.street !== user.billingAddress.street ||
           user.deliveryAddress.city !== user.billingAddress.city ||
           user.deliveryAddress.postalCode !== user.billingAddress.postalCode ||
           user.deliveryAddress.country !== user.billingAddress.country) : false;
        
        setUseDifferentDeliveryAddress(addressesAreDifferent);
      }
    }
  }, [user]);

  // Couleurs et styles
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const headingColor = useColorModeValue('gray.800', 'white');
  const accentColor = useColorModeValue('primary.500', 'primary.300');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const badgeBg = useColorModeValue('primary.50', 'primary.900');
  const badgeColor = useColorModeValue('primary.700', 'primary.200');
  const shadowColor = useColorModeValue('rgba(0, 0, 0, 0.1)', 'rgba(0, 0, 0, 0.3)');

  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite);
    showNotification(
      !isFavorite ? 'Ajouté aux favoris' : 'Retiré des favoris',
      !isFavorite ? 'success' : 'info'
    );
  };

  const handleShare = () => {
    // Implémenter le partage
    showNotification('Lien copié dans le presse-papier', 'success');
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'startDate') {
      setStartDate(value);
    } else if (name === 'endDate') {
      setEndDate(value);
    }
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  const handleDeliveryAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDeliveryAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBillingAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBillingAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRentalSubmit = async () => {
    if (!startDate || !endDate) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (end <= start) {
        setError('La date de fin doit être postérieure à la date de début');
        return;
      }
      
      const userId = user?.id;
      
      // Vérifier si l'utilisateur a déjà une demande en cours pour cet engin
      const userRequests = await getRentalRequestsByUser(userId!);
      const existingRequest = userRequests.find(request => {
        // Vérifier si la demande concerne le même équipement
        if (request.equipmentId !== id) return false;
        
        // Vérifier si la demande est en attente ou approuvée
        if (request.status === 'PENDING' || request.status === 'APPROVED') {
          // Vérifier si les dates se chevauchent
          const requestStart = new Date(request.startDate);
          const requestEnd = new Date(request.endDate);
          return (
            (start >= requestStart && start <= requestEnd) ||
            (end >= requestStart && end <= requestEnd) ||
            (start <= requestStart && end >= requestEnd)
          );
        }
        return false;
      });
      
      if (existingRequest) {
        const statusText = existingRequest.status === 'PENDING' ? 'en attente' : 'approuvée';
        setError(`Vous avez déjà une demande ${statusText} pour cet engin sur cette période. Veuillez attendre la réponse ou choisir une autre période.`);
        return;
      }
      
      if (!equipment) {
        throw new Error('Équipement non trouvé');
      }
      
      await createRentalRequest({
        equipmentId: id!,
        userId: userId!,
        startDate,
        endDate,
        message: message || '',
        status: 'PENDING',
        equipmentOwnerId: equipment.ownerId,
        clientName: `${user?.firstName} ${user?.lastName}`,
        equipmentName: equipment.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      showNotification('Demande de location envoyée avec succès', 'success');
      onClose();
      
      // Rediriger vers la page des demandes de location
      navigate('/rentals');
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de l\'envoi de la demande');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = () => {
    onClose();
    navigate('/profile');
  };

  useEffect(() => {
    const loadEquipmentDetails = async () => {
      if (!id || !user || (user.role !== 'PROFESSIONAL' && user.role !== 'BUSINESS')) {
        navigate('/');
        return;
      }

      try {
        setLoading(true);
        const equipmentData = await equipmentService.getEquipment(id);
        
        if (!equipmentData) {
          setError('Équipement non trouvé');
          return;
        }

        // Vérifier si l'utilisateur est le propriétaire de l'équipement
        if (equipmentData.ownerId !== user.id) {
          setError('Accès non autorisé');
          return;
        }

        // Charger l'historique des locations
        const history = await rentalService.getRentalRequestsByEquipment(id);
        setRentalHistory(history);
        setEquipmentData(equipmentData);
        setEditForm(equipmentData);
        setMaintenanceHistory(equipmentData.maintenanceHistory || []);
      } catch (err) {
        setError('Erreur lors du chargement des données');
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les détails de l\'équipement',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    loadEquipmentDetails();
  }, [id, user, navigate, toast]);

  const handleEditToggle = () => {
    setIsEditMode(!isEditMode);
  };

  const handleEditChange = (field: string, value: any) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSpecificationChange = (field: string, value: string) => {
    setEditForm(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [field]: value
      }
    }));
  };

  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      if (!equipmentData || !equipmentData.id) {
        throw new Error('Données d\'équipement invalides');
      }

      await equipmentService.updateEquipment(equipmentData.id, editForm);
      
      toast({
        title: 'Succès',
        description: 'Équipement mis à jour avec succès',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      setIsEditMode(false);
      setEquipmentData(editForm as Equipment);
    } catch (err) {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour l\'équipement',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddMaintenance = () => {
    onMaintenanceOpen();
  };

  const handleMaintenanceChange = (field: string, value: any) => {
    setNewMaintenance(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveMaintenance = async () => {
    try {
      if (!equipmentData || !equipmentData.id) {
        throw new Error('Données d\'équipement invalides');
      }

      const updatedMaintenanceHistory = [
        ...maintenanceHistory,
        {
          ...newMaintenance,
          id: Date.now().toString(),
          date: new Date(newMaintenance.date).toISOString()
        }
      ];

      const updatedEquipment = {
        ...equipmentData,
        maintenanceHistory: updatedMaintenanceHistory
      };

      await equipmentService.updateEquipment(equipmentData.id, updatedEquipment);
      
      setMaintenanceHistory(updatedMaintenanceHistory);
      setEquipmentData(updatedEquipment);
      
      toast({
        title: 'Succès',
        description: 'Maintenance ajoutée avec succès',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      onMaintenanceClose();
      setNewMaintenance({
        date: '',
        description: '',
        cost: 0,
        performedBy: ''
      });
    } catch (err) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ajouter la maintenance',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDeleteMaintenance = async (maintenanceId: string) => {
    try {
      if (!equipmentData || !equipmentData.id) {
        throw new Error('Données d\'équipement invalides');
      }

      const updatedMaintenanceHistory = maintenanceHistory.filter(
        maintenance => maintenance.id !== maintenanceId
      );

      const updatedEquipment = {
        ...equipmentData,
        maintenanceHistory: updatedMaintenanceHistory
      };

      await equipmentService.updateEquipment(equipmentData.id, updatedEquipment);
      
      setMaintenanceHistory(updatedMaintenanceHistory);
      setEquipmentData(updatedEquipment);
      
      toast({
        title: 'Succès',
        description: 'Maintenance supprimée avec succès',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer la maintenance',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      setLoading(true);
      await rentalService.updateRentalRequest(requestId, { status: 'APPROVED' });
      showNotification('Demande de location acceptée avec succès', 'success');
      // Recharger les demandes
      const updatedRequests = await rentalService.getRentalRequestsByEquipment(id!);
      setRentalRequests(updatedRequests);
    } catch (error) {
      console.error('Erreur lors de l\'acceptation de la demande:', error);
      showNotification('Impossible d\'accepter la demande', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      setLoading(true);
      await rentalService.updateRentalRequest(requestId, { status: 'REJECTED' });
      showNotification('Demande de location refusée', 'success');
      // Recharger les demandes
      const updatedRequests = await rentalService.getRentalRequestsByEquipment(id!);
      setRentalRequests(updatedRequests);
    } catch (error) {
      console.error('Erreur lors du refus de la demande:', error);
      showNotification('Impossible de refuser la demande', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEquipment = async () => {
    if (!equipmentData || !equipmentData.id) return;
    
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet équipement ? Cette action est irréversible.')) {
      return;
    }
    
    try {
      setLoading(true);
      await equipmentService.deleteEquipment(equipmentData.id);
      
      toast({
        title: 'Succès',
        description: 'Équipement supprimé avec succès',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      navigate('/dashboard');
    } catch (err) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer l\'équipement',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadRentalRequests = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        console.log('Chargement des demandes de location pour l\'équipement:', id);
        const data = await rentalService.getRentalRequestsByEquipment(id);
        console.log('Demandes de location chargées:', data);
        setRentalRequests(data);
      } catch (error) {
        console.error('Erreur lors du chargement des demandes de location:', error);
        showNotification('Impossible de charger les demandes de location', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadRentalRequests();
  }, [id, showNotification]);

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="blue.500" thickness="4px" />
      </Center>
    );
  }

  if (error || !equipmentData) {
    return (
      <Container maxW="container.xl" p={4}>
        <Box p={4} bg="red.50" color="red.500" borderRadius="md">
          <Text>{error || 'Équipement non trouvé'}</Text>
        </Box>
      </Container>
    );
  }

  // Calculer la note moyenne
  const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;

  return (
    <Container maxW="container.xl" p={4}>
      <VStack spacing={6} align="stretch">
        <Box>
          <HStack justify="space-between" mb={4}>
            <Button 
              leftIcon={<FaArrowLeft />} 
              variant="ghost" 
              onClick={() => navigate('/dashboard')}
            >
              Retour au tableau de bord
            </Button>
            <HStack>
              <Button
                leftIcon={<FaEdit />}
                colorScheme="blue"
                onClick={handleEditToggle}
              >
                {isEditMode ? 'Annuler' : 'Modifier'}
              </Button>
              <Button
                leftIcon={<FaTrash />}
                colorScheme="red"
                onClick={handleDeleteEquipment}
              >
                Supprimer
              </Button>
            </HStack>
          </HStack>
          <Heading as="h1" size="xl" mb={2} color={headingColor}>
            {equipmentData.name}
          </Heading>
          <HStack spacing={4}>
            <Badge colorScheme={equipmentData.isAvailable ? 'green' : 'red'}>
              {equipmentData.isAvailable ? 'Disponible' : 'Indisponible'}
            </Badge>
            <Badge colorScheme="blue">{equipmentData.category}</Badge>
          </HStack>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Stat>
                  <StatLabel>Prix par jour</StatLabel>
                  <StatNumber>{equipmentData.price}€</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    Depuis le dernier mois
                  </StatHelpText>
                </Stat>
              </VStack>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Stat>
                  <StatLabel>Locations totales</StatLabel>
                  <StatNumber>{rentalHistory.length}</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    Depuis le début
                  </StatHelpText>
                </Stat>
              </VStack>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Stat>
                  <StatLabel>Caution requise</StatLabel>
                  <StatNumber>{equipmentData.depositAmount}€</StatNumber>
                  <StatHelpText>
                    <StatArrow type="decrease" />
                    Montant fixe
                  </StatHelpText>
                </Stat>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        <Tabs variant="enclosed" colorScheme="blue" onChange={(index) => setTabIndex(index)}>
          <TabList>
            <Tab>Spécifications</Tab>
            <Tab>Historique</Tab>
            <Tab>Maintenance</Tab>
            <Tab>Demandes de location</Tab>
            <Tab>Disponibilités</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              {isEditMode ? (
                <VStack spacing={8} align="stretch">
                  <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} boxShadow="lg" borderRadius="xl">
                    <CardHeader bg="blue.50" borderTopRadius="xl">
                      <Heading size="md" color="blue.700">Informations générales</Heading>
                    </CardHeader>
                    <CardBody>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                        <FormControl>
                          <FormLabel fontWeight="medium" color="gray.700">Nom</FormLabel>
                          <Input 
                            value={editForm.name} 
                            onChange={(e) => handleEditChange('name', e.target.value)}
                            placeholder="Nom de l'équipement"
                            size="lg"
                            bg="white"
                            _hover={{ borderColor: 'blue.400' }}
                            _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel fontWeight="medium" color="gray.700">Catégorie</FormLabel>
                          <Select
                            value={editForm.category}
                            onChange={(e) => handleEditChange('category', e.target.value)}
                            placeholder="Sélectionner une catégorie"
                            size="lg"
                            bg="white"
                            _hover={{ borderColor: 'blue.400' }}
                            _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                          >
                            <option value="OUTILLAGE">Outillage</option>
                            <option value="MATERIEL">Matériel</option>
                            <option value="VEHICULE">Véhicule</option>
                            <option value="AUTRE">Autre</option>
                          </Select>
                        </FormControl>
                        <FormControl>
                          <FormLabel fontWeight="medium" color="gray.700">Prix par jour (€)</FormLabel>
                          <Input 
                            type="number" 
                            value={editForm.price} 
                            onChange={(e) => handleEditChange('price', parseFloat(e.target.value))}
                            placeholder="Prix par jour"
                            size="lg"
                            bg="white"
                            _hover={{ borderColor: 'blue.400' }}
                            _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel fontWeight="medium" color="gray.700">Caution (€)</FormLabel>
                          <Input 
                            type="number" 
                            value={editForm.depositAmount} 
                            onChange={(e) => handleEditChange('depositAmount', parseFloat(e.target.value))}
                            placeholder="Montant de la caution"
                            size="lg"
                            bg="white"
                            _hover={{ borderColor: 'blue.400' }}
                            _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel fontWeight="medium" color="gray.700">Localisation</FormLabel>
                          <Input 
                            value={editForm.location} 
                            onChange={(e) => handleEditChange('location', e.target.value)}
                            placeholder="Localisation de l'équipement"
                            size="lg"
                            bg="white"
                            _hover={{ borderColor: 'blue.400' }}
                            _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel fontWeight="medium" color="gray.700">Période de location minimum (jours)</FormLabel>
                          <Input 
                            type="number" 
                            value={editForm.minimumRentalPeriod} 
                            onChange={(e) => handleEditChange('minimumRentalPeriod', parseInt(e.target.value))}
                            placeholder="Période minimum de location"
                            size="lg"
                            bg="white"
                            _hover={{ borderColor: 'blue.400' }}
                            _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                          />
                        </FormControl>
                        <FormControl display="flex" alignItems="center">
                          <FormLabel mb="0" fontWeight="medium" color="gray.700">Disponible</FormLabel>
                          <Switch
                            isChecked={editForm.isAvailable}
                            onChange={(e) => handleEditChange('isAvailable', e.target.checked)}
                            colorScheme="green"
                            size="lg"
                          />
                        </FormControl>
                        <FormControl display="flex" alignItems="center">
                          <FormLabel mb="0" fontWeight="medium" color="gray.700">Actif</FormLabel>
                          <Switch
                            isChecked={editForm.isActive}
                            onChange={(e) => handleEditChange('isActive', e.target.checked)}
                            colorScheme="blue"
                            size="lg"
                          />
                        </FormControl>
                      </SimpleGrid>
                    </CardBody>
                  </Card>

                  <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} boxShadow="lg" borderRadius="xl">
                    <CardHeader bg="teal.50" borderTopRadius="xl">
                      <Heading size="md" color="teal.700">Spécifications techniques</Heading>
                    </CardHeader>
                    <CardBody>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                        <FormControl>
                          <FormLabel fontWeight="medium" color="gray.700">Marque</FormLabel>
                          <Input 
                            value={editForm.specifications?.brand || ''} 
                            onChange={(e) => handleSpecificationChange('brand', e.target.value)}
                            placeholder="Marque de l'équipement"
                            size="lg"
                            bg="white"
                            _hover={{ borderColor: 'blue.400' }}
                            _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel fontWeight="medium" color="gray.700">Modèle</FormLabel>
                          <Input 
                            value={editForm.specifications?.model || ''} 
                            onChange={(e) => handleSpecificationChange('model', e.target.value)}
                            placeholder="Modèle de l'équipement"
                            size="lg"
                            bg="white"
                            _hover={{ borderColor: 'blue.400' }}
                            _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel fontWeight="medium" color="gray.700">Année</FormLabel>
                          <Input 
                            value={editForm.specifications?.year || ''} 
                            onChange={(e) => handleSpecificationChange('year', e.target.value)}
                            placeholder="Année de fabrication"
                            size="lg"
                            bg="white"
                            _hover={{ borderColor: 'blue.400' }}
                            _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel fontWeight="medium" color="gray.700">Poids (kg)</FormLabel>
                          <Input 
                            value={editForm.specifications?.weight || ''} 
                            onChange={(e) => handleSpecificationChange('weight', e.target.value)}
                            placeholder="Poids en kg"
                            size="lg"
                            bg="white"
                            _hover={{ borderColor: 'blue.400' }}
                            _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel fontWeight="medium" color="gray.700">Puissance (ch)</FormLabel>
                          <Input 
                            value={editForm.specifications?.power || ''} 
                            onChange={(e) => handleSpecificationChange('power', e.target.value)}
                            placeholder="Puissance en chevaux"
                            size="lg"
                            bg="white"
                            _hover={{ borderColor: 'blue.400' }}
                            _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel fontWeight="medium" color="gray.700">Dimensions (L x l x h)</FormLabel>
                          <Input 
                            value={editForm.specifications?.dimensions || ''} 
                            onChange={(e) => handleSpecificationChange('dimensions', e.target.value)}
                            placeholder="Dimensions en mètres"
                            size="lg"
                            bg="white"
                            _hover={{ borderColor: 'blue.400' }}
                            _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel fontWeight="medium" color="gray.700">Capacité</FormLabel>
                          <Input 
                            value={editForm.specifications?.capacity || ''} 
                            onChange={(e) => handleSpecificationChange('capacity', e.target.value)}
                            placeholder="Capacité de l'équipement"
                            size="lg"
                            bg="white"
                            _hover={{ borderColor: 'blue.400' }}
                            _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel fontWeight="medium" color="gray.700">Type de moteur</FormLabel>
                          <Input 
                            value={editForm.specifications?.engineType || ''} 
                            onChange={(e) => handleSpecificationChange('engineType', e.target.value)}
                            placeholder="Type de moteur"
                            size="lg"
                            bg="white"
                            _hover={{ borderColor: 'blue.400' }}
                            _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                          />
                        </FormControl>
                      </SimpleGrid>
                    </CardBody>
                  </Card>

                  <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} boxShadow="lg" borderRadius="xl">
                    <CardHeader bg="purple.50" borderTopRadius="xl">
                      <Heading size="md" color="purple.700">Description</Heading>
                    </CardHeader>
                    <CardBody>
                      <FormControl>
                        <Textarea 
                          value={editForm.description} 
                          onChange={(e) => handleEditChange('description', e.target.value)}
                          placeholder="Description de l'équipement"
                          rows={4}
                          size="lg"
                          bg="white"
                          _hover={{ borderColor: 'blue.400' }}
                          _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                        />
                      </FormControl>
                    </CardBody>
                  </Card>

                  <HStack spacing={4} justify="flex-end" mt={4}>
                    <Button 
                      variant="outline" 
                      colorScheme="gray" 
                      onClick={() => setIsEditMode(false)}
                      size="lg"
                      leftIcon={<FaTimes />}
                    >
                      Annuler
                    </Button>
                    <Button 
                      colorScheme="blue" 
                      onClick={handleSaveChanges} 
                      isLoading={loading}
                      size="lg"
                      leftIcon={<FaSave />}
                      bg="blue.600"
                      _hover={{ bg: 'blue.700' }}
                    >
                      Enregistrer les modifications
                    </Button>
                  </HStack>
                </VStack>
              ) : (
                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
                  <GridItem>
                    <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} height="100%" boxShadow="md">
                      <CardBody>
                        <VStack spacing={4} align="stretch" height="100%">
                          <Heading size="md" color={headingColor}>
                            Caractéristiques principales
                          </Heading>
                          <Wrap spacing={3} flex="1">
                            <WrapItem>
                              <Tag size="md" colorScheme="blue">
                                <TagLeftIcon boxSize="12px" as={FaTachometerAlt} />
                                <TagLabel>Puissance: {equipmentData.specifications?.power || 'N/A'}</TagLabel>
                              </Tag>
                            </WrapItem>
                            <WrapItem>
                              <Tag size="md" colorScheme="blue">
                                <TagLeftIcon boxSize="12px" as={FaWeightHanging} />
                                <TagLabel>Poids: {equipmentData.specifications?.weight || 'N/A'}</TagLabel>
                              </Tag>
                            </WrapItem>
                            <WrapItem>
                              <Tag size="md" colorScheme="blue">
                                <TagLeftIcon boxSize="12px" as={FaRulerVertical} />
                                <TagLabel>Dimensions: {equipmentData.specifications?.dimensions || 'N/A'}</TagLabel>
                              </Tag>
                            </WrapItem>
                            <WrapItem>
                              <Tag size="md" colorScheme="blue">
                                <TagLeftIcon boxSize="12px" as={FaTools} />
                                <TagLabel>Capacité: {equipmentData.specifications?.capacity || 'N/A'}</TagLabel>
                              </Tag>
                            </WrapItem>
                          </Wrap>
                        </VStack>
                      </CardBody>
                    </Card>
                  </GridItem>

                  <GridItem>
                    <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} height="100%" boxShadow="md">
                      <CardBody>
                        <VStack spacing={4} align="stretch" height="100%">
                          <Heading size="md" color={headingColor}>
                            Informations techniques
                          </Heading>
                          <Wrap spacing={3} flex="1">
                            <WrapItem>
                              <Tag size="md" colorScheme="teal">
                                <TagLeftIcon boxSize="12px" as={FaTools} />
                                <TagLabel>Marque: {equipmentData.specifications?.brand || 'N/A'}</TagLabel>
                              </Tag>
                            </WrapItem>
                            <WrapItem>
                              <Tag size="md" colorScheme="teal">
                                <TagLeftIcon boxSize="12px" as={FaCog} />
                                <TagLabel>Modèle: {equipmentData.specifications?.model || 'N/A'}</TagLabel>
                              </Tag>
                            </WrapItem>
                            <WrapItem>
                              <Tag size="md" colorScheme="teal">
                                <TagLeftIcon boxSize="12px" as={FaHistory} />
                                <TagLabel>Année: {equipmentData.specifications?.year || 'N/A'}</TagLabel>
                              </Tag>
                            </WrapItem>
                            <WrapItem>
                              <Tag size="md" colorScheme="teal">
                                <TagLeftIcon boxSize="12px" as={FaCog} />
                                <TagLabel>Type de moteur: {equipmentData.specifications?.engineType || 'N/A'}</TagLabel>
                              </Tag>
                            </WrapItem>
                          </Wrap>
                        </VStack>
                      </CardBody>
                    </Card>
                  </GridItem>
                  
                  <GridItem>
                    <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} height="100%" boxShadow="md">
                      <CardBody>
                        <VStack spacing={4} align="stretch" height="100%">
                          <Heading size="md" color={headingColor}>
                            Informations de location
                          </Heading>
                          <Wrap spacing={3} flex="1">
                            <WrapItem>
                              <Tag size="md" colorScheme="purple">
                                <TagLeftIcon boxSize="12px" as={FaEuroSign} />
                                <TagLabel>Prix par jour: {equipmentData.price}€</TagLabel>
                              </Tag>
                            </WrapItem>
                            <WrapItem>
                              <Tag size="md" colorScheme="purple">
                                <TagLeftIcon boxSize="12px" as={FaShieldAlt} />
                                <TagLabel>Caution: {equipmentData.depositAmount}€</TagLabel>
                              </Tag>
                            </WrapItem>
                            <WrapItem>
                              <Tag size="md" colorScheme="purple">
                                <TagLeftIcon boxSize="12px" as={FaClock} />
                                <TagLabel>Période minimum: {equipmentData.minimumRentalPeriod} jours</TagLabel>
                              </Tag>
                            </WrapItem>
                            <WrapItem>
                              <Tag size="md" colorScheme="purple">
                                <TagLeftIcon boxSize="12px" as={FaMapMarkerAlt} />
                                <TagLabel>Localisation: {equipmentData.location || 'N/A'}</TagLabel>
                              </Tag>
                            </WrapItem>
                          </Wrap>
                        </VStack>
                      </CardBody>
                    </Card>
                  </GridItem>
                  
                  <GridItem>
                    <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} height="100%" boxShadow="md">
                      <CardBody>
                        <VStack spacing={4} align="stretch" height="100%">
                          <Heading size="md" color={headingColor}>
                            Statut
                          </Heading>
                          <Wrap spacing={3} flex="1">
                            <WrapItem>
                              <Tag size="md" colorScheme={equipmentData.isAvailable ? "green" : "red"}>
                                <TagLeftIcon boxSize="12px" as={equipmentData.isAvailable ? FaCheckCircle : FaTimesCircle} />
                                <TagLabel>{equipmentData.isAvailable ? "Disponible" : "Indisponible"}</TagLabel>
                              </Tag>
                            </WrapItem>
                            <WrapItem>
                              <Tag size="md" colorScheme={equipmentData.isActive ? "green" : "red"}>
                                <TagLeftIcon boxSize="12px" as={equipmentData.isActive ? FaCheckCircle : FaTimesCircle} />
                                <TagLabel>{equipmentData.isActive ? "Actif" : "Inactif"}</TagLabel>
                              </Tag>
                            </WrapItem>
                            <WrapItem>
                              <Tag size="md" colorScheme={equipmentData.isRented ? "yellow" : "blue"}>
                                <TagLeftIcon boxSize="12px" as={FaTruck} />
                                <TagLabel>{equipmentData.isRented ? "En location" : "Non loué"}</TagLabel>
                              </Tag>
                            </WrapItem>
                          </Wrap>
                        </VStack>
                      </CardBody>
                    </Card>
                  </GridItem>
                </Grid>
              )}
            </TabPanel>

            <TabPanel>
              <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <Heading size="md" color={headingColor}>
                      Historique des locations
                    </Heading>
                    {rentalHistory.length === 0 ? (
                      <Text color={textColor}>Aucune location enregistrée</Text>
                    ) : (
                      <TableContainer>
                        <Table variant="simple">
                          <Thead>
                            <Tr>
                              <Th>Client</Th>
                              <Th>Date début</Th>
                              <Th>Date fin</Th>
                              <Th>Statut</Th>
                              <Th>Prix</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {rentalHistory.map((rental) => (
                              <Tr key={rental.id}>
                                <Td>{rental.clientName}</Td>
                                <Td>{new Date(rental.startDate).toLocaleDateString()}</Td>
                                <Td>{new Date(rental.endDate).toLocaleDateString()}</Td>
                                <Td>
                                  <Badge
                                    colorScheme={
                                      rental.status === 'COMPLETED'
                                        ? 'green'
                                        : rental.status === 'CANCELLED'
                                        ? 'red'
                                        : 'yellow'
                                    }
                                  >
                                    {rental.status === 'PENDING' ? 'En attente' :
                                     rental.status === 'APPROVED' ? 'Approuvée' :
                                     rental.status === 'ACTIVE' ? 'En cours' :
                                     rental.status === 'COMPLETED' ? 'Terminée' : 'Annulée'}
                                  </Badge>
                                </Td>
                                <Td>{rental.price}€</Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </TableContainer>
                    )}
                  </VStack>
                </CardBody>
              </Card>
            </TabPanel>

            <TabPanel>
              <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <HStack justify="space-between">
                      <Heading size="md" color={headingColor}>
                        Historique de maintenance
                      </Heading>
                      <Button 
                        leftIcon={<FaPlus />} 
                        colorScheme="blue" 
                        size="sm"
                        onClick={handleAddMaintenance}
                      >
                        Ajouter une maintenance
                      </Button>
                    </HStack>
                    
                    {/* Statistiques de maintenance pour les comptes pro et business */}
                    {(user?.role === 'PROFESSIONAL' || user?.role === 'BUSINESS') && maintenanceHistory.length > 0 && (
                      <Card bg="blue.50" borderWidth="1px" borderColor="blue.200" borderRadius="lg" p={4} mb={4}>
                        <Heading size="sm" color="blue.700" mb={4}>Statistiques de maintenance</Heading>
                        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
                          <Stat>
                            <StatLabel>Nombre total</StatLabel>
                            <StatNumber>{maintenanceHistory.length}</StatNumber>
                            <StatHelpText>
                              <StatArrow type="increase" />
                              Maintenances effectuées
                            </StatHelpText>
                          </Stat>
                          <Stat>
                            <StatLabel>Coût total</StatLabel>
                            <StatNumber>
                              {maintenanceHistory.reduce((sum, item) => sum + (item.cost || 0), 0).toFixed(2)}€
                            </StatNumber>
                            <StatHelpText>
                              <StatArrow type="decrease" />
                              Investissement total
                            </StatHelpText>
                          </Stat>
                          <Stat>
                            <StatLabel>Dernière maintenance</StatLabel>
                            <StatNumber>
                              {new Date(Math.max(...maintenanceHistory.map(m => new Date(m.date).getTime()))).toLocaleDateString()}
                            </StatNumber>
                            <StatHelpText>
                              <StatArrow type="increase" />
                              Date du dernier entretien
                            </StatHelpText>
                          </Stat>
                          <Stat>
                            <StatLabel>Coût moyen</StatLabel>
                            <StatNumber>
                              {(maintenanceHistory.reduce((sum, item) => sum + (item.cost || 0), 0) / maintenanceHistory.length).toFixed(2)}€
                            </StatNumber>
                            <StatHelpText>
                              <StatArrow type="decrease" />
                              Par intervention
                            </StatHelpText>
                          </Stat>
                        </SimpleGrid>
                      </Card>
                    )}
                    
                    {maintenanceHistory.length === 0 ? (
                      <Text color={textColor}>Aucune maintenance enregistrée</Text>
                    ) : (
                      <TableContainer>
                        <Table variant="simple">
                          <Thead>
                            <Tr>
                              <Th>Date</Th>
                              <Th>Description</Th>
                              <Th>Coût</Th>
                              <Th>Effectué par</Th>
                              <Th>Actions</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {maintenanceHistory.map((maintenance) => (
                              <Tr key={maintenance.id}>
                                <Td>{new Date(maintenance.date).toLocaleDateString()}</Td>
                                <Td>{maintenance.description}</Td>
                                <Td>{maintenance.cost}€</Td>
                                <Td>{maintenance.performedBy}</Td>
                                <Td>
                                  <IconButton
                                    aria-label="Supprimer la maintenance"
                                    icon={<FaTrash />}
                                    size="sm"
                                    colorScheme="red"
                                    onClick={() => handleDeleteMaintenance(maintenance.id)}
                                  />
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </TableContainer>
                    )}
                  </VStack>
                </CardBody>
              </Card>
            </TabPanel>

            <TabPanel>
              <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <Heading size="md" color={headingColor}>
                      Demandes de location en attente
                    </Heading>
                    {rentalRequests.length === 0 ? (
                      <Text color={textColor}>Aucune demande en attente</Text>
                    ) : (
                      <TableContainer>
                        <Table variant="simple">
                          <Thead>
                            <Tr>
                              <Th>Client</Th>
                              <Th>Date début</Th>
                              <Th>Date fin</Th>
                              <Th>Prix proposé</Th>
                              <Th>Actions</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {rentalRequests.map((request) => (
                              <Tr key={request.id}>
                                <Td>{request.clientName}</Td>
                                <Td>{new Date(request.startDate).toLocaleDateString()}</Td>
                                <Td>{new Date(request.endDate).toLocaleDateString()}</Td>
                                <Td>{request.proposedPrice}€</Td>
                                <Td>
                                  <ButtonGroup size="sm" variant="ghost">
                                    <IconButton
                                      aria-label="Accepter"
                                      icon={<FaCheck />}
                                      colorScheme="green"
                                      onClick={() => handleAcceptRequest(request.id)}
                                      isLoading={loading}
                                    />
                                    <IconButton
                                      aria-label="Refuser"
                                      icon={<FaTimes />}
                                      colorScheme="red"
                                      onClick={() => handleRejectRequest(request.id)}
                                      isLoading={loading}
                                    />
                                  </ButtonGroup>
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </TableContainer>
                    )}
                  </VStack>
                </CardBody>
              </Card>
            </TabPanel>

            <TabPanel>
              <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <Heading size="md" color={headingColor}>
                      Disponibilités
                    </Heading>
                    {(() => { console.log('État des disponibilités:', { loadingAvailabilities, availabilities }); return null; })()}
                    {loadingAvailabilities ? (
                      <Spinner />
                    ) : equipmentData?.availabilitySchedule ? (
                      <TableContainer>
                        <Table variant="simple">
                          <Thead>
                            <Tr>
                              <Th>Date</Th>
                              <Th>Disponibilité</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {Object.entries(equipmentData.availabilitySchedule).map(([date, isAvailable]) => (
                              <Tr key={date}>
                                <Td>{new Date(date).toLocaleDateString()}</Td>
                                <Td>
                                  <Badge colorScheme={isAvailable ? 'green' : 'red'}>
                                    {isAvailable ? 'Disponible' : 'Indisponible'}
                                  </Badge>
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Text>Aucune disponibilité enregistrée</Text>
                    )}
                  </VStack>
                </CardBody>
              </Card>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>

      {/* Modal d'ajout de maintenance */}
      <Modal isOpen={isMaintenanceOpen} onClose={onMaintenanceClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Ajouter une maintenance</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Date</FormLabel>
                <Input 
                  type="date" 
                  value={newMaintenance.date} 
                  onChange={(e) => handleMaintenanceChange('date', e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea 
                  value={newMaintenance.description} 
                  onChange={(e) => handleMaintenanceChange('description', e.target.value)}
                  placeholder="Description des travaux effectués"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Coût (€)</FormLabel>
                <Input 
                  type="number" 
                  value={newMaintenance.cost} 
                  onChange={(e) => handleMaintenanceChange('cost', parseFloat(e.target.value))}
                  placeholder="Coût de la maintenance"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Effectué par</FormLabel>
                <Input 
                  value={newMaintenance.performedBy} 
                  onChange={(e) => handleMaintenanceChange('performedBy', e.target.value)}
                  placeholder="Nom du technicien"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onMaintenanceClose}>
              Annuler
            </Button>
            <Button colorScheme="blue" onClick={handleSaveMaintenance}>
              Enregistrer
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default EquipmentDetails; 