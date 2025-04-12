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
  CardHeader,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Checkbox,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  SimpleGrid,
  Badge,
  Icon,
  useToast,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  IconButton,
  useDisclosure,
  ScaleFade,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Center,
  Image,
  Stack,
  Tag,
  TagLabel,
  TagLeftIcon,
  TagRightIcon,
  Progress,
  Wrap,
  WrapItem,
  useBreakpointValue,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Switch,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { 
  FiUser, FiMapPin, FiCreditCard, FiCalendar, FiStar, FiSettings, 
  FiChevronDown, FiLogOut, FiBell, FiHelpCircle, FiClock, FiCheck, 
  FiX, FiPrinter, FiEdit2, FiSave, FiTrash2, FiPackage, FiTruck, 
  FiDollarSign, FiTrendingUp, FiTrendingDown, FiAlertCircle, 
  FiCheckCircle, FiXCircle, FiFilter, FiSearch, FiPlus, FiMinus,
  FiEye, FiEyeOff, FiDownload, FiUpload, FiRefreshCw, FiInfo
} from 'react-icons/fi';
import { RootState, AppDispatch } from '../store';
import { updateProfile } from '../store/slices/authSlice';
import { User, Address, RentalRequest, Equipment } from '../types';
import { getRentalRequestsByUser, getRentalRequestsByEquipment, cancelRentalRequest } from '../services/rentalService';
import { getEquipments } from '../services/equipmentService';

const Profile = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading, error } = useSelector((state: RootState) => state.auth);
  const toast = useToast();
  const [formData, setFormData] = useState<Partial<User>>({
    firstName: '',
    lastName: '',
    email: '',
    deliveryAddress: {
      street: '',
      city: '',
      postalCode: '',
      country: 'France'
    },
    billingAddress: {
      street: '',
      city: '',
      postalCode: '',
      country: 'France'
    }
  });
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [useSameAddress, setUseSameAddress] = useState(true);
  const [rentalRequests, setRentalRequests] = useState<RentalRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [equipmentMap, setEquipmentMap] = useState<Record<string, Equipment>>({});
  const [selectedRequest, setSelectedRequest] = useState<RentalRequest | null>(null);
  const { isOpen: isInvoiceModalOpen, onOpen: onInvoiceModalOpen, onClose: onInvoiceModalClose } = useDisclosure();
  const [activeTab, setActiveTab] = useState(0);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure();
  const [selectedRequestToDelete, setSelectedRequestToDelete] = useState<RentalRequest | null>(null);
  
  // Couleurs et styles
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const menuBg = useColorModeValue('white', 'gray.800');
  const menuHoverBg = useColorModeValue('gray.50', 'gray.700');
  const menuBorderColor = useColorModeValue('gray.200', 'gray.700');
  const menuShadow = useColorModeValue('lg', 'dark-lg');
  const primaryColor = useColorModeValue('blue.500', 'blue.300');
  const secondaryColor = useColorModeValue('purple.500', 'purple.300');
  const accentColor = useColorModeValue('teal.500', 'teal.300');
  
  // Responsive
  const isMobile = useBreakpointValue({ base: true, md: false });
  const isTablet = useBreakpointValue({ base: false, md: true, lg: false });
  const isDesktop = useBreakpointValue({ base: false, md: false, lg: true });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        deliveryAddress: user.deliveryAddress || {
          street: '',
          city: '',
          postalCode: '',
          country: 'France'
        },
        billingAddress: user.billingAddress || {
          street: '',
          city: '',
          postalCode: '',
          country: 'France'
        }
      });
      
      if (user.deliveryAddress && user.billingAddress) {
        const sameAddress = 
          user.deliveryAddress.street === user.billingAddress.street &&
          user.deliveryAddress.city === user.billingAddress.city &&
          user.deliveryAddress.postalCode === user.billingAddress.postalCode &&
          user.deliveryAddress.country === user.billingAddress.country;
        
        setUseSameAddress(sameAddress);
      }
    }
  }, [user]);

  useEffect(() => {
    const loadRentalRequests = async () => {
      if (user) {
        try {
          setLoadingRequests(true);
          // Récupérer les demandes où l'utilisateur est le demandeur
          const userRequests = await getRentalRequestsByUser(user.id);
          
          // Récupérer les demandes pour les équipements dont l'utilisateur est propriétaire
          const ownerRequests = await Promise.all(
            Object.values(equipmentMap)
              .filter(equipment => equipment.ownerId === user.id)
              .map(equipment => getRentalRequestsByEquipment(equipment.id))
          );
          
          // Fusionner et dédupliquer les demandes
          const allRequests = [...userRequests];
          ownerRequests.flat().forEach(request => {
            if (!allRequests.some(r => r.id === request.id)) {
              allRequests.push(request);
            }
          });
          
          setRentalRequests(allRequests);
        } catch (error) {
          console.error('Erreur lors du chargement des demandes de location:', error);
          toast({
            title: "Erreur",
            description: "Impossible de charger vos demandes de location",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        } finally {
          setLoadingRequests(false);
        }
      }
    };

    loadRentalRequests();
  }, [user, toast, equipmentMap]);

  useEffect(() => {
    const loadEquipmentMap = async () => {
      if (user) {
        try {
          const equipments = await getEquipments();
          const equipmentMap = equipments.reduce((acc, equipment) => {
            acc[equipment.id] = equipment;
            return acc;
          }, {} as Record<string, Equipment>);
          setEquipmentMap(equipmentMap);
        } catch (error) {
          console.error('Erreur lors du chargement des équipements:', error);
          toast({
            title: "Erreur",
            description: "Impossible de charger les équipements",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        }
      }
    };

    loadEquipmentMap();
  }, [user, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePrintInvoice = (request: RentalRequest) => {
    setSelectedRequest(request);
    onInvoiceModalOpen();
  };

  const printInvoice = () => {
    if (!selectedRequest || !user) return;

    const startDate = new Date(selectedRequest.startDate);
    const endDate = new Date(selectedRequest.endDate);
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const equipment = equipmentMap[selectedRequest.equipmentId];
    const totalCost = days * (equipment?.price || 0);
    const displayName = `${user.firstName} ${user.lastName}`;

    const invoiceContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Facture de location</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .invoice-details { margin-bottom: 20px; }
            .client-details { margin-bottom: 20px; }
            .equipment-details { margin-bottom: 20px; }
            .total { font-weight: bold; margin-top: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 10px; border: 1px solid #ddd; }
            th { background-color: #f5f5f5; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Facture de location</h1>
            <p>Date: ${new Date().toLocaleDateString()}</p>
          </div>
          <div class="client-details">
            <h2>Client</h2>
            <p>Nom: ${displayName}</p>
            <p>Email: ${user.email}</p>
          </div>
          <div class="equipment-details">
            <h2>Détails de la location</h2>
            <table>
              <tr>
                <th>Équipement</th>
                <td>${equipment?.name || 'Non spécifié'}</td>
              </tr>
              <tr>
                <th>Période</th>
                <td>Du ${startDate.toLocaleDateString()} au ${endDate.toLocaleDateString()}</td>
              </tr>
              <tr>
                <th>Prix journalier</th>
                <td>${equipment?.price || 0} €</td>
              </tr>
              <tr>
                <th>Nombre de jours</th>
                <td>${days}</td>
              </tr>
            </table>
          </div>
          <div class="total">
            <h2>Total: ${totalCost} €</h2>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(invoiceContent);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
    onInvoiceModalClose();
  };

  const handleAddressChange = (type: 'deliveryAddress' | 'billingAddress', field: keyof Address, value: string) => {
    setFormData((prev) => {
      const updatedAddress = {
        ...prev[type],
        [field]: value
      };
      
      return {
        ...prev,
        [type]: updatedAddress
      };
    });
  };

  const handleSameAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setUseSameAddress(checked);
    
    if (checked && formData.deliveryAddress) {
      setFormData(prev => ({
        ...prev,
        billingAddress: {
          street: prev.deliveryAddress?.street || '',
          city: prev.deliveryAddress?.city || '',
          postalCode: prev.deliveryAddress?.postalCode || '',
          country: prev.deliveryAddress?.country || 'France'
        }
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      try {
        await dispatch(updateProfile({ ...user, ...formData }));
        toast({
          title: "Profil mis à jour",
          description: "Vos informations ont été enregistrées avec succès",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        setIsEditing(false);
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la mise à jour du profil",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <FiClock color="orange" />;
      case 'APPROVED':
        return <FiCheck color="green" />;
      case 'REJECTED':
        return <FiX color="red" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'En attente';
      case 'APPROVED':
        return 'Approuvée';
      case 'REJECTED':
        return 'Refusée';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'orange';
      case 'APPROVED':
        return 'green';
      case 'REJECTED':
        return 'red';
      default:
        return 'gray';
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    try {
      await cancelRentalRequest(requestId);
      setRentalRequests(prev => prev.filter(req => req.id !== requestId));
      toast({
        title: 'Demande annulée',
        description: 'La demande de location a été annulée avec succès.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Erreur lors de l\'annulation de la demande:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de l\'annulation de la demande.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Statistiques
  const getStats = () => {
    if (!rentalRequests.length) return { total: 0, pending: 0, approved: 0, rejected: 0 };
    
    return {
      total: rentalRequests.length,
      pending: rentalRequests.filter(r => r.status === 'PENDING').length,
      approved: rentalRequests.filter(r => r.status === 'APPROVED').length,
      rejected: rentalRequests.filter(r => r.status === 'REJECTED').length
    };
  };

  const stats = getStats();
  
  // Filtrage des demandes
  const filteredRequests = rentalRequests.filter(request => {
    // Filtre par statut
    if (filterStatus && request.status !== filterStatus) return false;
    
    // Filtre par recherche
    if (searchTerm) {
      const equipment = equipmentMap[request.equipmentId];
      const searchLower = searchTerm.toLowerCase();
      
      return (
        equipment?.name.toLowerCase().includes(searchLower) ||
        new Date(request.startDate).toLocaleDateString().includes(searchTerm) ||
        new Date(request.endDate).toLocaleDateString().includes(searchTerm)
      );
    }
    
    return true;
  });

  const handleDeleteClick = (request: RentalRequest) => {
    setSelectedRequestToDelete(request);
    onDeleteModalOpen();
  };

  const handleDeleteConfirm = () => {
    if (selectedRequestToDelete) {
      handleCancelRequest(selectedRequestToDelete.id);
      setSelectedRequestToDelete(null);
    }
    onDeleteModalClose();
  };

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color={primaryColor} thickness="4px" />
      </Center>
    );
  }

  if (!user) return null;

  return (
    <Container maxW="container.xl" py={8}>
      {/* En-tête du profil */}
      <Card mb={8} overflow="hidden" borderRadius="xl" boxShadow="xl">
        <Box 
          bgGradient="linear(to-r, blue.500, purple.500)" 
          h="120px" 
          position="relative"
        />
        <Flex 
          direction={{ base: "column", md: "row" }} 
          align={{ base: "center", md: "flex-end" }} 
          justify="space-between"
          px={6}
          pb={6}
          position="relative"
          mt="-60px"
        >
          <Flex align="center" direction={{ base: "column", md: "row" }}>
            <Avatar 
              size="xl" 
              name={`${user.firstName} ${user.lastName}`} 
              border="4px solid white"
              boxShadow="lg"
              mb={{ base: 4, md: 0 }}
              mr={{ base: 0, md: 4 }}
            />
            <Box textAlign={{ base: "center", md: "left" }}>
              <Heading size="lg">{`${user.firstName} ${user.lastName}`}</Heading>
              <Text color={textColor}>{user.email}</Text>
              <Badge colorScheme={user.role === 'PROFESSIONAL' ? 'purple' : user.role === 'BUSINESS' ? 'blue' : 'green'} mt={2}>
                {user.role === 'PROFESSIONAL' ? 'Professionnel' : user.role === 'BUSINESS' ? 'Entreprise' : 'Client'}
              </Badge>
            </Box>
          </Flex>
          <Button 
            leftIcon={<FiEdit2 />} 
            colorScheme="blue" 
            variant="outline" 
            onClick={() => setIsEditing(!isEditing)}
            mt={{ base: 4, md: 0 }}
          >
            {isEditing ? 'Annuler' : 'Modifier le profil'}
          </Button>
        </Flex>
      </Card>

      {/* Statistiques */}
      <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={6} mb={8}>
        <Card bg={cardBg} borderRadius="lg" boxShadow="md">
          <CardBody>
            <Stat>
              <StatLabel color={textColor}>Total des demandes</StatLabel>
              <StatNumber fontSize="3xl">{stats.total}</StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                {stats.total > 0 ? `${Math.round((stats.approved / stats.total) * 100)}% approuvées` : 'Aucune demande'}
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        
        <Card bg={cardBg} borderRadius="lg" boxShadow="md">
          <CardBody>
            <Stat>
              <StatLabel color={textColor}>En attente</StatLabel>
              <StatNumber fontSize="3xl" color="orange.500">{stats.pending}</StatNumber>
              <StatHelpText>
                <StatArrow type="decrease" />
                {stats.pending > 0 ? 'En cours de traitement' : 'Aucune demande en attente'}
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        
        <Card bg={cardBg} borderRadius="lg" boxShadow="md">
          <CardBody>
            <Stat>
              <StatLabel color={textColor}>Approuvées</StatLabel>
              <StatNumber fontSize="3xl" color="green.500">{stats.approved}</StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                {stats.approved > 0 ? 'Demandes acceptées' : 'Aucune demande approuvée'}
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        
        <Card bg={cardBg} borderRadius="lg" boxShadow="md">
          <CardBody>
            <Stat>
              <StatLabel color={textColor}>Refusées</StatLabel>
              <StatNumber fontSize="3xl" color="red.500">{stats.rejected}</StatNumber>
              <StatHelpText>
                <StatArrow type="decrease" />
                {stats.rejected > 0 ? 'Demandes refusées' : 'Aucune demande refusée'}
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Onglets principaux */}
      <Tabs 
        variant="enclosed" 
        colorScheme="blue" 
        index={activeTab} 
        onChange={setActiveTab}
        isLazy
      >
        <TabList mb={4} overflowX="auto" overflowY="hidden" whiteSpace="nowrap">
          <Tab>
            <HStack>
              <Icon as={FiUser} />
              <Text>Profil</Text>
            </HStack>
          </Tab>
          <Tab>
            <HStack>
              <Icon as={FiPackage} />
              <Text>Mes demandes</Text>
              {stats.total > 0 && (
                <Badge colorScheme="blue" borderRadius="full" ml={2}>
                  {stats.total}
                </Badge>
              )}
            </HStack>
          </Tab>
          {user.role === 'PROFESSIONAL' && (
            <Tab>
              <HStack>
                <Icon as={FiTruck} />
                <Text>Mes équipements</Text>
              </HStack>
            </Tab>
          )}
          <Tab>
            <HStack>
              <Icon as={FiSettings} />
              <Text>Paramètres</Text>
            </HStack>
          </Tab>
        </TabList>

        <TabPanels>
          {/* Onglet Profil */}
          <TabPanel p={0}>
            <Card bg={cardBg} borderRadius="lg" boxShadow="md" overflow="hidden">
              <CardHeader bg={useColorModeValue('gray.50', 'gray.700')} py={4}>
                <Heading size="md">Informations personnelles</Heading>
              </CardHeader>
              <CardBody>
                {isEditing ? (
                  <form onSubmit={handleSubmit}>
                    <VStack spacing={6} align="stretch">
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                        <FormControl isRequired>
                          <FormLabel>Prénom</FormLabel>
                          <Input
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            placeholder="Votre prénom"
                            borderRadius="md"
                          />
                        </FormControl>
                        <FormControl isRequired>
                          <FormLabel>Nom</FormLabel>
                          <Input
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            placeholder="Votre nom"
                            borderRadius="md"
                          />
                        </FormControl>
                      </SimpleGrid>
                      
                      <FormControl isRequired>
                        <FormLabel>Email</FormLabel>
                        <Input
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="Votre email"
                          borderRadius="md"
                          isDisabled
                        />
                        <Text fontSize="sm" color="gray.500" mt={1}>
                          L'email ne peut pas être modifié
                        </Text>
                      </FormControl>
                      
                      <Divider />
                      
                      <Heading size="sm" mb={2}>Adresse de livraison</Heading>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                        <FormControl isRequired>
                          <FormLabel>Rue</FormLabel>
                          <Input
                            name="deliveryAddress.street"
                            value={formData.deliveryAddress?.street}
                            onChange={(e) => handleAddressChange('deliveryAddress', 'street', e.target.value)}
                            placeholder="Votre adresse"
                            borderRadius="md"
                          />
                        </FormControl>
                        <FormControl isRequired>
                          <FormLabel>Ville</FormLabel>
                          <Input
                            name="deliveryAddress.city"
                            value={formData.deliveryAddress?.city}
                            onChange={(e) => handleAddressChange('deliveryAddress', 'city', e.target.value)}
                            placeholder="Votre ville"
                            borderRadius="md"
                          />
                        </FormControl>
                        <FormControl isRequired>
                          <FormLabel>Code postal</FormLabel>
                          <Input
                            name="deliveryAddress.postalCode"
                            value={formData.deliveryAddress?.postalCode}
                            onChange={(e) => handleAddressChange('deliveryAddress', 'postalCode', e.target.value)}
                            placeholder="Votre code postal"
                            borderRadius="md"
                          />
                        </FormControl>
                        <FormControl isRequired>
                          <FormLabel>Pays</FormLabel>
                          <Input
                            name="deliveryAddress.country"
                            value={formData.deliveryAddress?.country}
                            onChange={(e) => handleAddressChange('deliveryAddress', 'country', e.target.value)}
                            placeholder="Votre pays"
                            borderRadius="md"
                          />
                        </FormControl>
                      </SimpleGrid>
                      
                      <Checkbox
                        isChecked={useSameAddress}
                        onChange={handleSameAddressChange}
                        colorScheme="blue"
                      >
                        Utiliser la même adresse pour la facturation
                      </Checkbox>
                      
                      {!useSameAddress && (
                        <>
                          <Divider />
                          <Heading size="sm" mb={2}>Adresse de facturation</Heading>
                          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                            <FormControl isRequired>
                              <FormLabel>Rue</FormLabel>
                              <Input
                                name="billingAddress.street"
                                value={formData.billingAddress?.street}
                                onChange={(e) => handleAddressChange('billingAddress', 'street', e.target.value)}
                                placeholder="Votre adresse de facturation"
                                borderRadius="md"
                              />
                            </FormControl>
                            <FormControl isRequired>
                              <FormLabel>Ville</FormLabel>
                              <Input
                                name="billingAddress.city"
                                value={formData.billingAddress?.city}
                                onChange={(e) => handleAddressChange('billingAddress', 'city', e.target.value)}
                                placeholder="Votre ville de facturation"
                                borderRadius="md"
                              />
                            </FormControl>
                            <FormControl isRequired>
                              <FormLabel>Code postal</FormLabel>
                              <Input
                                name="billingAddress.postalCode"
                                value={formData.billingAddress?.postalCode}
                                onChange={(e) => handleAddressChange('billingAddress', 'postalCode', e.target.value)}
                                placeholder="Votre code postal de facturation"
                                borderRadius="md"
                              />
                            </FormControl>
                            <FormControl isRequired>
                              <FormLabel>Pays</FormLabel>
                              <Input
                                name="billingAddress.country"
                                value={formData.billingAddress?.country}
                                onChange={(e) => handleAddressChange('billingAddress', 'country', e.target.value)}
                                placeholder="Votre pays de facturation"
                                borderRadius="md"
                              />
                            </FormControl>
                          </SimpleGrid>
                        </>
                      )}
                      
                      <HStack spacing={4} justify="flex-end" mt={4}>
                        <Button
                          variant="outline"
                          onClick={() => setIsEditing(false)}
                          leftIcon={<FiX />}
                        >
                          Annuler
                        </Button>
                        <Button
                          type="submit"
                          colorScheme="blue"
                          leftIcon={<FiSave />}
                          isLoading={loading}
                        >
                          Enregistrer
                        </Button>
                      </HStack>
                    </VStack>
                  </form>
                ) : (
                  <VStack spacing={6} align="stretch">
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      <Box>
                        <Text fontWeight="bold" color={textColor}>Prénom</Text>
                        <Text fontSize="lg">{user.firstName}</Text>
                      </Box>
                      <Box>
                        <Text fontWeight="bold" color={textColor}>Nom</Text>
                        <Text fontSize="lg">{user.lastName}</Text>
                      </Box>
                    </SimpleGrid>
                    
                    <Box>
                      <Text fontWeight="bold" color={textColor}>Email</Text>
                      <Text fontSize="lg">{user.email}</Text>
                    </Box>
                    
                    <Divider />
                    
                    <Box>
                      <Heading size="sm" mb={4}>Adresse de livraison</Heading>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                        <Box>
                          <Text fontWeight="bold" color={textColor}>Rue</Text>
                          <Text fontSize="lg">{user.deliveryAddress?.street || 'Non renseignée'}</Text>
                        </Box>
                        <Box>
                          <Text fontWeight="bold" color={textColor}>Ville</Text>
                          <Text fontSize="lg">{user.deliveryAddress?.city || 'Non renseignée'}</Text>
                        </Box>
                        <Box>
                          <Text fontWeight="bold" color={textColor}>Code postal</Text>
                          <Text fontSize="lg">{user.deliveryAddress?.postalCode || 'Non renseigné'}</Text>
                        </Box>
                        <Box>
                          <Text fontWeight="bold" color={textColor}>Pays</Text>
                          <Text fontSize="lg">{user.deliveryAddress?.country || 'Non renseigné'}</Text>
                        </Box>
                      </SimpleGrid>
                    </Box>
                    
                    {!useSameAddress && (
                      <>
                        <Divider />
                        <Box>
                          <Heading size="sm" mb={4}>Adresse de facturation</Heading>
                          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                            <Box>
                              <Text fontWeight="bold" color={textColor}>Rue</Text>
                              <Text fontSize="lg">{user.billingAddress?.street || 'Non renseignée'}</Text>
                            </Box>
                            <Box>
                              <Text fontWeight="bold" color={textColor}>Ville</Text>
                              <Text fontSize="lg">{user.billingAddress?.city || 'Non renseignée'}</Text>
                            </Box>
                            <Box>
                              <Text fontWeight="bold" color={textColor}>Code postal</Text>
                              <Text fontSize="lg">{user.billingAddress?.postalCode || 'Non renseigné'}</Text>
                            </Box>
                            <Box>
                              <Text fontWeight="bold" color={textColor}>Pays</Text>
                              <Text fontSize="lg">{user.billingAddress?.country || 'Non renseigné'}</Text>
                            </Box>
                          </SimpleGrid>
                        </Box>
                      </>
                    )}
                    
                    <HStack spacing={4} justify="flex-end" mt={4}>
                      <Button
                        colorScheme="blue"
                        leftIcon={<FiEdit2 />}
                        onClick={() => setIsEditing(true)}
                      >
                        Modifier
                      </Button>
                    </HStack>
                  </VStack>
                )}
              </CardBody>
            </Card>
          </TabPanel>

          {/* Onglet Demandes */}
          <TabPanel p={0}>
            <Card bg={cardBg} borderRadius="lg" boxShadow="md" overflow="hidden">
              <CardHeader bg={useColorModeValue('gray.50', 'gray.700')} py={4}>
                <Flex justify="space-between" align="center" direction={{ base: "column", md: "row" }} gap={4}>
                  <Heading size="md">Mes demandes de location</Heading>
                  
                  <HStack spacing={4} width={{ base: "100%", md: "auto" }}>
                    <FormControl maxW={{ base: "100%", md: "200px" }}>
                      <InputGroup>
                        <InputLeftElement>
                          <Icon as={FiSearch} color="gray.400" />
                        </InputLeftElement>
                        <Input
                          placeholder="Rechercher..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          borderRadius="md"
                        />
                      </InputGroup>
                    </FormControl>
                    
                    <Menu closeOnSelect={false}>
                      <MenuButton
                        as={Button}
                        rightIcon={<FiChevronDown />}
                        leftIcon={<FiFilter />}
                        variant="outline"
                        borderRadius="md"
                      >
                        Statut
                      </MenuButton>
                      <MenuList>
                        <MenuItem 
                          onClick={() => setFilterStatus(null)}
                          bg={!filterStatus ? useColorModeValue('blue.50', 'blue.900') : undefined}
                        >
                          Tous
                        </MenuItem>
                        <MenuItem 
                          onClick={() => setFilterStatus('PENDING')}
                          bg={filterStatus === 'PENDING' ? useColorModeValue('blue.50', 'blue.900') : undefined}
                        >
                          En attente
                        </MenuItem>
                        <MenuItem 
                          onClick={() => setFilterStatus('APPROVED')}
                          bg={filterStatus === 'APPROVED' ? useColorModeValue('blue.50', 'blue.900') : undefined}
                        >
                          Approuvées
                        </MenuItem>
                        <MenuItem 
                          onClick={() => setFilterStatus('REJECTED')}
                          bg={filterStatus === 'REJECTED' ? useColorModeValue('blue.50', 'blue.900') : undefined}
                        >
                          Refusées
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </HStack>
                </Flex>
              </CardHeader>
              
              <CardBody>
                {loadingRequests ? (
                  <Center py={10}>
                    <Spinner size="xl" color={primaryColor} thickness="4px" />
                  </Center>
                ) : filteredRequests.length === 0 ? (
                  <Center py={10} flexDirection="column">
                    <Icon as={FiPackage} boxSize={16} color={textColor} mb={4} />
                    <Text fontSize="lg" color={textColor}>Aucune demande de location</Text>
                    <Text color={textColor}>Vous n'avez pas encore fait de demande de location</Text>
                  </Center>
                ) : (
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                    {filteredRequests.map((request) => {
                      const equipment = equipmentMap[request.equipmentId];
                      const isOwner = equipment?.ownerId === user.id;
                      const startDate = new Date(request.startDate);
                      const endDate = new Date(request.endDate);
                      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                      const totalCost = days * (equipment?.price || 0);
                      
                      return (
                        <Card 
                          key={request.id} 
                          borderRadius="lg" 
                          overflow="hidden"
                          boxShadow="md"
                          transition="all 0.3s"
                          _hover={{ transform: 'translateY(-5px)', boxShadow: 'lg' }}
                        >
                          <Box 
                            h="8px" 
                            bg={getStatusColor(request.status)} 
                          />
                          
                          <CardBody>
                            <VStack align="stretch" spacing={4}>
                              <Flex justify="space-between" align="center">
                                <Badge 
                                  colorScheme={
                                    request.status === 'PENDING' ? 'yellow' : 
                                    request.status === 'APPROVED' ? 'green' : 'red'
                                  }
                                  px={2}
                                  py={1}
                                  borderRadius="full"
                                >
                                  {getStatusText(request.status)}
                                </Badge>
                                
                                <Tag 
                                  size="md" 
                                  colorScheme={isOwner ? 'purple' : 'blue'} 
                                  borderRadius="full"
                                >
                                  <TagLeftIcon as={isOwner ? FiTruck : FiUser} />
                                  <TagLabel>{isOwner ? 'Propriétaire' : 'Demandeur'}</TagLabel>
                                </Tag>
                              </Flex>
                              
                              <Box>
                                <Text fontWeight="bold" fontSize="lg" noOfLines={1}>
                                  {equipment?.name || 'Équipement non trouvé'}
                                </Text>
                                <Text color={textColor} fontSize="sm">
                                  {equipment?.category || 'Catégorie non spécifiée'}
                                </Text>
                              </Box>
                              
                              <SimpleGrid columns={2} spacing={4}>
                                <Box>
                                  <Text fontWeight="bold" color={textColor} fontSize="sm">Date de début</Text>
                                  <Text>{startDate.toLocaleDateString()}</Text>
                                </Box>
                                <Box>
                                  <Text fontWeight="bold" color={textColor} fontSize="sm">Date de fin</Text>
                                  <Text>{endDate.toLocaleDateString()}</Text>
                                </Box>
                                <Box>
                                  <Text fontWeight="bold" color={textColor} fontSize="sm">Durée</Text>
                                  <Text>{days} jour{days > 1 ? 's' : ''}</Text>
                                </Box>
                                <Box>
                                  <Text fontWeight="bold" color={textColor} fontSize="sm">Coût total</Text>
                                  <Text fontWeight="bold" color="green.500">{totalCost} €</Text>
                                </Box>
                              </SimpleGrid>
                              
                              <Divider />
                              
                              <HStack spacing={2} justify="flex-end">
                                {request.status === 'APPROVED' && (
                                  <Button
                                    size="sm"
                                    colorScheme="blue"
                                    variant="outline"
                                    leftIcon={<FiPrinter />}
                                    onClick={() => handlePrintInvoice(request)}
                                  >
                                    Facture
                                  </Button>
                                )}
                                
                                {request.status === 'PENDING' && isOwner && (
                                  <Button
                                    size="sm"
                                    colorScheme="red"
                                    variant="outline"
                                    leftIcon={<FiX />}
                                    onClick={() => handleCancelRequest(request.id)}
                                  >
                                    Refuser
                                  </Button>
                                )}
                                
                                {request.status === 'REJECTED' && (
                                  <Button
                                    size="sm"
                                    colorScheme="red"
                                    variant="ghost"
                                    leftIcon={<FiTrash2 />}
                                    onClick={() => handleDeleteClick(request)}
                                  >
                                    Supprimer
                                  </Button>
                                )}
                              </HStack>
                            </VStack>
                          </CardBody>
                        </Card>
                      );
                    })}
                  </SimpleGrid>
                )}
              </CardBody>
            </Card>
          </TabPanel>

          {/* Onglet Équipements (pour les professionnels) */}
          {user.role === 'PROFESSIONAL' && (
            <TabPanel p={0}>
              <Card bg={cardBg} borderRadius="lg" boxShadow="md" overflow="hidden">
                <CardHeader bg={useColorModeValue('gray.50', 'gray.700')} py={4}>
                  <Flex justify="space-between" align="center">
                    <Heading size="md">Mes équipements</Heading>
                    <Button 
                      leftIcon={<FiPlus />} 
                      colorScheme="blue"
                      size="sm"
                      onClick={() => window.location.href = '/equipment/new'}
                    >
                      Ajouter un équipement
                    </Button>
                  </Flex>
                </CardHeader>
                
                <CardBody>
                  {Object.values(equipmentMap).filter(eq => eq.ownerId === user.id).length === 0 ? (
                    <Center py={10} flexDirection="column">
                      <Icon as={FiTruck} boxSize={16} color={textColor} mb={4} />
                      <Text fontSize="lg" color={textColor}>Aucun équipement</Text>
                      <Text color={textColor} mb={4}>Vous n'avez pas encore ajouté d'équipement</Text>
                      <Button 
                        leftIcon={<FiPlus />} 
                        colorScheme="blue"
                        onClick={() => window.location.href = '/equipment/new'}
                      >
                        Ajouter un équipement
                      </Button>
                    </Center>
                  ) : (
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                      {Object.values(equipmentMap)
                        .filter(eq => eq.ownerId === user.id)
                        .map((equipment) => (
                          <Card 
                            key={equipment.id} 
                            borderRadius="lg" 
                            overflow="hidden"
                            boxShadow="md"
                            transition="all 0.3s"
                            _hover={{ transform: 'translateY(-5px)', boxShadow: 'lg' }}
                          >
                            <Box 
                              h="8px" 
                              bg={equipment.isAvailable ? 'green.500' : 'red.500'} 
                            />
                            
                            <CardBody>
                              <VStack align="stretch" spacing={4}>
                                <Box>
                                  <Text fontWeight="bold" fontSize="lg" noOfLines={1}>
                                    {equipment.name}
                                  </Text>
                                  <Text color={textColor} fontSize="sm">
                                    {equipment.category || 'Catégorie non spécifiée'}
                                  </Text>
                                </Box>
                                
                                <SimpleGrid columns={2} spacing={4}>
                                  <Box>
                                    <Text fontWeight="bold" color={textColor} fontSize="sm">Prix par jour</Text>
                                    <Text fontWeight="bold" color="green.500">{equipment.price} €</Text>
                                  </Box>
                                  <Box>
                                    <Text fontWeight="bold" color={textColor} fontSize="sm">Disponibilité</Text>
                                    <Badge 
                                      colorScheme={equipment.isAvailable ? 'green' : 'red'}
                                      borderRadius="full"
                                    >
                                      {equipment.isAvailable ? 'Disponible' : 'Indisponible'}
                                    </Badge>
                                  </Box>
                                </SimpleGrid>
                                
                                <Divider />
                                
                                <HStack spacing={2} justify="flex-end">
                                  <Button
                                    size="sm"
                                    colorScheme="blue"
                                    variant="outline"
                                    leftIcon={<FiEdit2 />}
                                    onClick={() => window.location.href = `/equipment/edit/${equipment.id}/`}
                                  >
                                    Modifier
                                  </Button>
                                  <Button
                                    size="sm"
                                    colorScheme={equipment.isAvailable ? 'red' : 'green'}
                                    variant="outline"
                                    leftIcon={equipment.isAvailable ? <FiX /> : <FiCheck />}
                                    onClick={() => window.location.href = `/equipment/${equipment.id}/availability`}
                                  >
                                    {equipment.isAvailable ? 'Marquer indisponible' : 'Marquer disponible'}
                                  </Button>
                                </HStack>
                              </VStack>
                            </CardBody>
                          </Card>
                        ))}
                    </SimpleGrid>
                  )}
                </CardBody>
              </Card>
            </TabPanel>
          )}

          {/* Onglet Paramètres */}
          <TabPanel p={0}>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <Card bg={cardBg} borderRadius="lg" boxShadow="md" overflow="hidden">
                <CardHeader bg={useColorModeValue('gray.50', 'gray.700')} py={4}>
                  <Heading size="md">Préférences de compte</Heading>
                </CardHeader>
                <CardBody>
                  <VStack align="stretch" spacing={4}>
                    <FormControl display="flex" alignItems="center">
                      <FormLabel htmlFor="email-notifications" mb="0">
                        Notifications par email
                      </FormLabel>
                      <Switch id="email-notifications" colorScheme="blue" defaultChecked />
                    </FormControl>
                    
                    <FormControl display="flex" alignItems="center">
                      <FormLabel htmlFor="sms-notifications" mb="0">
                        Notifications par SMS
                      </FormLabel>
                      <Switch id="sms-notifications" colorScheme="blue" />
                    </FormControl>
                    
                    <FormControl display="flex" alignItems="center">
                      <FormLabel htmlFor="marketing-emails" mb="0">
                        Emails marketing
                      </FormLabel>
                      <Switch id="marketing-emails" colorScheme="blue" />
                    </FormControl>
                    
                    <Button 
                      colorScheme="blue" 
                      variant="outline" 
                      leftIcon={<FiSave />}
                      mt={4}
                    >
                      Enregistrer les préférences
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
              
              <Card bg={cardBg} borderRadius="lg" boxShadow="md" overflow="hidden">
                <CardHeader bg={useColorModeValue('gray.50', 'gray.700')} py={4}>
                  <Heading size="md">Sécurité</Heading>
                </CardHeader>
                <CardBody>
                  <VStack align="stretch" spacing={4}>
                    <Button 
                      leftIcon={<FiSettings />} 
                      variant="outline"
                      justifyContent="flex-start"
                    >
                      Changer le mot de passe
                    </Button>
                    
                    <Button 
                      leftIcon={<FiBell />} 
                      variant="outline"
                      justifyContent="flex-start"
                    >
                      Gérer les notifications
                    </Button>
                    
                    <Button 
                      leftIcon={<FiHelpCircle />} 
                      variant="outline"
                      justifyContent="flex-start"
                    >
                      Aide et support
                    </Button>
                    
                    <Divider my={2} />
                    
                    <Button 
                      leftIcon={<FiLogOut />} 
                      colorScheme="red" 
                      variant="ghost"
                      justifyContent="flex-start"
                    >
                      Se déconnecter
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            </SimpleGrid>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Modale d'impression de facture */}
      <Modal isOpen={isInvoiceModalOpen} onClose={onInvoiceModalClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Facture de location</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedRequest && (
              <VStack align="stretch" spacing={4}>
                <Box p={4} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="md">
                  <Heading size="sm" mb={2}>Détails de la location</Heading>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <Box>
                      <Text fontWeight="bold" color={textColor}>Équipement</Text>
                      <Text>{equipmentMap[selectedRequest.equipmentId]?.name || 'Équipement non trouvé'}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" color={textColor}>Prix par jour</Text>
                      <Text>{equipmentMap[selectedRequest.equipmentId]?.price || 0} €</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" color={textColor}>Date de début</Text>
                      <Text>{new Date(selectedRequest.startDate).toLocaleDateString()}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" color={textColor}>Date de fin</Text>
                      <Text>{new Date(selectedRequest.endDate).toLocaleDateString()}</Text>
                    </Box>
                  </SimpleGrid>
                </Box>
                
                <Box p={4} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="md">
                  <Heading size="sm" mb={2}>Calcul du coût</Heading>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <Box>
                      <Text fontWeight="bold" color={textColor}>Nombre de jours</Text>
                      <Text>
                        {Math.ceil(
                          (new Date(selectedRequest.endDate).getTime() - new Date(selectedRequest.startDate).getTime()) / 
                          (1000 * 60 * 60 * 24)
                        )}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" color={textColor}>Coût total</Text>
                      <Text fontSize="lg" fontWeight="bold" color="green.500">
                        {Math.ceil(
                          (new Date(selectedRequest.endDate).getTime() - new Date(selectedRequest.startDate).getTime()) / 
                          (1000 * 60 * 60 * 24)
                        ) * (equipmentMap[selectedRequest.equipmentId]?.price || 0)} €
                      </Text>
                    </Box>
                  </SimpleGrid>
                </Box>
                
                <Box p={4} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="md">
                  <Heading size="sm" mb={2}>Aperçu de la facture</Heading>
                  <Box 
                    p={4} 
                    bg="white" 
                    borderRadius="md" 
                    border="1px solid" 
                    borderColor={borderColor}
                    fontSize="sm"
                  >
                    <div dangerouslySetInnerHTML={{ __html: `
                      <div style="font-family: Arial, sans-serif; padding: 20px;">
                        <div style="text-align: center; margin-bottom: 30px;">
                          <h1 style="color: #3182ce;">Facture de location</h1>
                          <p>Date: ${new Date().toLocaleDateString()}</p>
                        </div>
                        
                        <div style="margin-bottom: 20px;">
                          <h3>Client</h3>
                          <p>${user.firstName} ${user.lastName}</p>
                          <p>${user.email}</p>
                          <p>${user.deliveryAddress?.street || ''}</p>
                          <p>${user.deliveryAddress?.postalCode || ''} ${user.deliveryAddress?.city || ''}</p>
                          <p>${user.deliveryAddress?.country || ''}</p>
                        </div>
                        
                        <div style="margin-bottom: 20px;">
                          <h3>Équipement</h3>
                          <p>${equipmentMap[selectedRequest.equipmentId]?.name || 'Équipement non trouvé'}</p>
                          <p>Prix par jour: ${equipmentMap[selectedRequest.equipmentId]?.price || 0} €</p>
                        </div>
                        
                        <div style="margin-bottom: 20px;">
                          <h3>Période de location</h3>
                          <p>Du ${new Date(selectedRequest.startDate).toLocaleDateString()} au ${new Date(selectedRequest.endDate).toLocaleDateString()}</p>
                          <p>Nombre de jours: ${Math.ceil(
                            (new Date(selectedRequest.endDate).getTime() - new Date(selectedRequest.startDate).getTime()) / 
                            (1000 * 60 * 60 * 24)
                          )}</p>
                        </div>
                        
                        <div style="margin-top: 30px; border-top: 1px solid #ddd; padding-top: 10px;">
                          <h3 style="text-align: right;">Total: ${Math.ceil(
                            (new Date(selectedRequest.endDate).getTime() - new Date(selectedRequest.startDate).getTime()) / 
                            (1000 * 60 * 60 * 24)
                          ) * (equipmentMap[selectedRequest.equipmentId]?.price || 0)} €</h3>
                        </div>
                      </div>
                    `}} />
                  </Box>
                </Box>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onInvoiceModalClose}>
              Fermer
            </Button>
            <Button 
              colorScheme="blue" 
              leftIcon={<FiPrinter />} 
              onClick={printInvoice}
              isDisabled={!selectedRequest}
            >
              Imprimer
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modale de confirmation de suppression */}
      <Modal isOpen={isDeleteModalOpen} onClose={onDeleteModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirmer la suppression</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              Êtes-vous sûr de vouloir supprimer définitivement cette demande de location ?
              {selectedRequestToDelete && (
                <VStack align="start" mt={4} spacing={2}>
                  <Text><strong>Équipement:</strong> {equipmentMap[selectedRequestToDelete.equipmentId]?.name}</Text>
                  <Text><strong>Date de début:</strong> {new Date(selectedRequestToDelete.startDate).toLocaleDateString()}</Text>
                  <Text><strong>Date de fin:</strong> {new Date(selectedRequestToDelete.endDate).toLocaleDateString()}</Text>
                </VStack>
              )}
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDeleteModalClose}>
              Annuler
            </Button>
            <Button
              colorScheme="red"
              onClick={handleDeleteConfirm}
              leftIcon={<FiTrash2 />}
            >
              Supprimer définitivement
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default Profile; 