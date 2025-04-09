import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Box,
  Text,
  Heading,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Input,
  InputGroup,
  InputRightElement,
  Badge,
  Card,
  CardBody,
  CardFooter,
  Image,
  Stack,
  Tag,
  IconButton,
  Alert,
  AlertIcon,
  Select,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  useDisclosure,
  useMediaQuery,
  ThemeTypings,
  HStack,
  SimpleGrid,
  VStack,
  Divider,
  useToast,
  Flex,
  Spinner,
  Center,
  Fade,
  ScaleFade,
  SlideFade,
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
  StatGroup,
  Progress,
  Tooltip,
  useColorModeValue,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Switch,
} from '@chakra-ui/react';
import {
  FaEdit,
  FaTrash,
  FaMapMarkerAlt,
  FaClock,
  FaEuroSign,
  FaList,
  FaChartLine,
  FaBox,
  FaCheckCircle,
  FaPlus,
  FaCalendarAlt,
  FaChartBar,
  FaUsers,
  FaBell,
  FaCog,
  FaFilter,
  FaSearch,
  FaEllipsisV,
  FaFileExport,
  FaFileImport,
  FaHistory,
  FaChartPie,
  FaUserCog,
  FaShieldAlt,
  FaClipboardList,
  FaCalendarCheck,
  FaExclamationTriangle,
} from 'react-icons/fa';
import { RootState } from '../store';
import { User, UserRole, Equipment } from '../types/index';
import { addEquipment, updateEquipment, setEquipment } from '../store/slices/equipmentSlice';
import * as equipmentService from '../services/equipmentService';
import { useNotification } from '../contexts/NotificationContext';

// Types pour les événements
interface InputChangeEvent extends React.ChangeEvent<HTMLInputElement> {
  target: HTMLInputElement & {
    name: string;
    value: string;
  };
}

interface SelectChangeEvent extends React.ChangeEvent<HTMLSelectElement> {
  target: HTMLSelectElement & {
    name: string;
    value: string;
  };
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth) as { user: User | null };
  const equipment = useSelector((state: RootState) => state.equipment.items);
  const loading = useSelector((state: RootState) => state.equipment.loading);
  const error = useSelector((state: RootState) => state.equipment.error);
  const { showNotification } = useNotification();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isMobile] = useMediaQuery("(max-width: 48em)");
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    specifications: {} as Record<string, string>,
    location: '',
  });
  const [specificationFields, setSpecificationFields] = useState<string[]>(['poids', 'puissance', 'capacité']);
  const [sortBy, setSortBy] = useState('name');
  const [filterCategory, setFilterCategory] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [isProUser, setIsProUser] = useState(false);
  const [isBusinessUser, setIsBusinessUser] = useState(false);
  const [rentalStats, setRentalStats] = useState({
    totalRentals: 0,
    activeRentals: 0,
    completedRentals: 0,
    revenue: 0,
    averageRating: 0,
  });
  const [recentActivity, setRecentActivity] = useState([
    { id: 1, type: 'rental', message: 'Nouvelle location: Pelle mécanique', date: '2023-06-15', status: 'completed' },
    { id: 2, type: 'equipment', message: 'Engin ajouté: Bulldozer', date: '2023-06-14', status: 'active' },
    { id: 3, type: 'review', message: 'Nouvelle évaluation: 5 étoiles', date: '2023-06-13', status: 'completed' },
  ]);

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

  // Calcul des statistiques
  const stats = {
    totalEquipment: equipment.length,
    availableEquipment: equipment.filter(e => e.isAvailable).length,
    totalValue: equipment.reduce((sum, e) => sum + e.price, 0),
    averagePrice: equipment.length > 0 
      ? Math.round(equipment.reduce((sum, e) => sum + e.price, 0) / equipment.length) 
      : 0
  };

  // Catégories prédéfinies
  const categories = [
    { value: 'excavation', label: 'Excavation' },
    { value: 'transport', label: 'Transport' },
    { value: 'construction', label: 'Construction' },
    { value: 'manutention', label: 'Manutention' },
    { value: 'compactage', label: 'Compactage' },
    { value: 'nettoyage', label: 'Nettoyage' },
    { value: 'forage', label: 'Forage' },
    { value: 'autres', label: 'Autres' },
  ];

  // Vérifier le type d'utilisateur
  useEffect(() => {
    if (user) {
      setIsProUser(user.role === UserRole.PROFESSIONAL);
      setIsBusinessUser(user.role === UserRole.BUSINESS);
    }
  }, [user]);

  // Charger les engins de l'utilisateur
  React.useEffect(() => {
    const loadUserEquipment = async () => {
      if (user?.id) {
        try {
          const userEquipment = await equipmentService.getEquipmentsByOwner(user.id);
          dispatch(setEquipment(userEquipment));
        } catch (error) {
          console.error('Erreur lors du chargement des engins:', error);
          setLocalError('Erreur lors du chargement de vos engins');
        }
      }
    };

    loadUserEquipment();
  }, [user?.id, dispatch]);

  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleAddEquipment = () => {
    setSelectedEquipment(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      image: '',
      specifications: {},
      location: '',
    });
    setSpecificationFields(['poids', 'puissance', 'capacité']);
    setLocalError('');
    onOpen();
  };

  const handleEditEquipment = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setFormData({
      name: equipment.name,
      description: equipment.description,
      price: equipment.price.toString(),
      category: equipment.category,
      image: (equipment as Equipment & { image?: string }).image || '',
      specifications: equipment.specifications || {},
      location: equipment.location || '',
    });
    
    // Définir les champs de spécifications à afficher
    const specKeys = Object.keys(equipment.specifications || {});
    setSpecificationFields(specKeys.length > 0 ? specKeys : ['poids', 'puissance', 'capacité']);
    
    setLocalError('');
    onOpen();
  };

  const handleCloseDialog = () => {
    onClose();
    setLocalError('');
  };

  const handleInputChange = (e: InputChangeEvent | SelectChangeEvent) => {
    const { name, value } = e.target;
    if (name.startsWith('spec_')) {
      const specName = name.replace('spec_', '');
      setFormData(prev => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [specName]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAddSpecField = (fieldKey: string) => {
    if (!specificationFields.includes(fieldKey)) {
      setSpecificationFields([...specificationFields, fieldKey]);
    }
  };

  const handleRemoveSpecField = (fieldKey: string) => {
    setSpecificationFields(specificationFields.filter(field => field !== fieldKey));
  };

  const handleSubmit = async () => {
    try {
      // Vérification du rôle de l'utilisateur
      if (user?.role !== UserRole.PROFESSIONAL && user?.role !== UserRole.BUSINESS) {
        setLocalError('Vous n\'avez pas les permissions nécessaires pour ajouter un engin');
        return;
      }

      // Validation des champs obligatoires
      if (!formData.name || !formData.description || !formData.price || !formData.category) {
        setLocalError('Veuillez remplir tous les champs obligatoires');
        return;
      }

      // Validation du prix
      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        setLocalError('Le prix doit être un nombre positif');
        return;
      }

      // Filtrer les spécifications vides
      const filteredSpecs: Record<string, string> = {};
      Object.entries(formData.specifications).forEach(([key, value]) => {
        if (value && value.trim() !== '') {
          filteredSpecs[key] = value;
        }
      });

      const equipmentData = {
        name: formData.name,
        description: formData.description,
        price: price,
        category: formData.category,
        specifications: filteredSpecs,
        ownerId: user?.id || '',
        isAvailable: true,
        image: formData.image || 'https://via.placeholder.com/300x200',
        location: formData.location || '',
      };

      console.log('Données de l\'équipement à sauvegarder:', equipmentData);

      if (selectedEquipment) {
        await equipmentService.updateEquipment(selectedEquipment.id, equipmentData);
        dispatch(updateEquipment({ ...equipmentData, id: selectedEquipment.id }));
      } else {
        const newEquipment = await equipmentService.addEquipment(equipmentData);
        dispatch(addEquipment(newEquipment));
      }

      handleCloseDialog();
    } catch (error: any) {
      console.error('Erreur détaillée:', error);
      setLocalError(`Une erreur est survenue lors de l'enregistrement de l'engin: ${error.message}`);
    }
  };

  const handleDeleteEquipment = async (equipmentId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet engin ?')) {
      try {
        // TODO: Implement delete equipment
        console.log('Delete equipment:', equipmentId);
      } catch (error) {
        setLocalError('Une erreur est survenue lors de la suppression de l\'engin');
      }
    }
  };

  // Types pour les événements
  const handleFilterCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterCategory(e.target.value);
  };

  const handleSortByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  };

  // Styles avec types corrects
  const cardHoverStyle = {
    transform: 'translateY(-5px)',
    boxShadow: 'xl',
  };

  if (!user) return null;

  return (
    <Box maxW="100vw" px={4} py={8}>
      <Fade in={true}>
        <Box mb={8}>
          <Heading as="h1" size="xl" mb={2}>Tableau de bord</Heading>
          <Text color="gray.600">
            {isProUser ? "Gérez vos engins de chantier et suivez vos locations" : 
             isBusinessUser ? "Gérez votre flotte d'engins et optimisez vos revenus" : 
             "Gérez vos engins de chantier"}
          </Text>
        </Box>
      </Fade>

      {/* Statistiques */}
      <ScaleFade in={true} initialScale={0.9}>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={6} mb={8}>
          <Box
            p={5}
            bgGradient="linear(to-br, blue.50, blue.100)"
            borderRadius="xl"
            boxShadow="md"
            transition="all 0.3s"
            _hover={{ transform: 'translateY(-5px)', boxShadow: 'lg' }}
            position="relative"
            overflow="hidden"
          >
            <Box position="absolute" top={0} right={0} opacity={0.1}>
              <FaBox size="100px" />
            </Box>
            <VStack align="start" spacing={2}>
              <HStack>
                <Box p={2} bg="blue.500" color="white" borderRadius="lg">
                  <FaBox size="24px" />
                </Box>
                <Text fontSize="sm" fontWeight="medium" color="blue.700">
                  Total des engins
                </Text>
              </HStack>
              <Text fontSize="3xl" fontWeight="bold" color="blue.800">
                {stats.totalEquipment}
              </Text>
              <HStack fontSize="sm" color="blue.600">
                <FaChartLine />
                <Text>+{Math.floor(Math.random() * 10)}% ce mois</Text>
              </HStack>
            </VStack>
          </Box>

          <Box
            p={5}
            bgGradient="linear(to-br, green.50, green.100)"
            borderRadius="xl"
            boxShadow="md"
            transition="all 0.3s"
            _hover={{ transform: 'translateY(-5px)', boxShadow: 'lg' }}
            position="relative"
            overflow="hidden"
          >
            <Box position="absolute" top={0} right={0} opacity={0.1}>
              <FaCheckCircle size="100px" />
            </Box>
            <VStack align="start" spacing={2}>
              <HStack>
                <Box p={2} bg="green.500" color="white" borderRadius="lg">
                  <FaCheckCircle size="24px" />
                </Box>
                <Text fontSize="sm" fontWeight="medium" color="green.700">
                  Engins disponibles
                </Text>
              </HStack>
              <Text fontSize="3xl" fontWeight="bold" color="green.800">
                {stats.availableEquipment}
              </Text>
              <HStack fontSize="sm" color="green.600">
                <FaChartLine />
                <Text>{Math.round((stats.availableEquipment / stats.totalEquipment) * 100)}% du total</Text>
              </HStack>
            </VStack>
          </Box>

          <Box
            p={5}
            bgGradient="linear(to-br, purple.50, purple.100)"
            borderRadius="xl"
            boxShadow="md"
            transition="all 0.3s"
            _hover={{ transform: 'translateY(-5px)', boxShadow: 'lg' }}
            position="relative"
            overflow="hidden"
          >
            <Box position="absolute" top={0} right={0} opacity={0.1}>
              <FaEuroSign size="100px" />
            </Box>
            <VStack align="start" spacing={2}>
              <HStack>
                <Box p={2} bg="purple.500" color="white" borderRadius="lg">
                  <FaEuroSign size="24px" />
                </Box>
                <Text fontSize="sm" fontWeight="medium" color="purple.700">
                  Valeur totale
                </Text>
              </HStack>
              <Text fontSize="3xl" fontWeight="bold" color="purple.800">
                {stats.totalValue.toLocaleString()}€
              </Text>
              <HStack fontSize="sm" color="purple.600">
                <FaChartLine />
                <Text>+{Math.floor(Math.random() * 15)}% ce mois</Text>
              </HStack>
            </VStack>
          </Box>

          <Box
            p={5}
            bgGradient="linear(to-br, orange.50, orange.100)"
            borderRadius="xl"
            boxShadow="md"
            transition="all 0.3s"
            _hover={{ transform: 'translateY(-5px)', boxShadow: 'lg' }}
            position="relative"
            overflow="hidden"
          >
            <Box position="absolute" top={0} right={0} opacity={0.1}>
              <FaChartLine size="100px" />
            </Box>
            <VStack align="start" spacing={2}>
              <HStack>
                <Box p={2} bg="orange.500" color="white" borderRadius="lg">
                  <FaChartLine size="24px" />
                </Box>
                <Text fontSize="sm" fontWeight="medium" color="orange.700">
                  Prix moyen/jour
                </Text>
              </HStack>
              <Text fontSize="3xl" fontWeight="bold" color="orange.800">
                {stats.averagePrice.toLocaleString()}€
              </Text>
              <HStack fontSize="sm" color="orange.600">
                <FaChartLine />
                <Text>+{Math.floor(Math.random() * 8)}% ce mois</Text>
              </HStack>
            </VStack>
          </Box>
        </SimpleGrid>
      </ScaleFade>

      {/* Statistiques supplémentaires pour les comptes pro et business */}
      {(isProUser || isBusinessUser) && (
        <ScaleFade in={true} initialScale={0.9}>
          <Card mb={8} borderRadius="xl" boxShadow="md" overflow="hidden">
            <CardBody>
              <Heading size="md" mb={4}>Statistiques de location</Heading>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
                <Stat>
                  <StatLabel>Locations totales</StatLabel>
                  <StatNumber>{rentalStats.totalRentals}</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    23.36%
                  </StatHelpText>
                </Stat>
                <Stat>
                  <StatLabel>Locations actives</StatLabel>
                  <StatNumber>{rentalStats.activeRentals}</StatNumber>
                  <StatHelpText>
                    <StatArrow type="decrease" />
                    9.05%
                  </StatHelpText>
                </Stat>
                <Stat>
                  <StatLabel>Revenus</StatLabel>
                  <StatNumber>{rentalStats.revenue.toLocaleString()}€</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    12.5%
                  </StatHelpText>
                </Stat>
                <Stat>
                  <StatLabel>Note moyenne</StatLabel>
                  <StatNumber>{rentalStats.averageRating.toFixed(1)}</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    0.2
                  </StatHelpText>
                </Stat>
              </SimpleGrid>
            </CardBody>
          </Card>
        </ScaleFade>
      )}

      {/* Onglets pour les comptes pro et business */}
      {(isProUser || isBusinessUser) && (
        <Box mb={6}>
          <Tabs 
            variant="enclosed" 
            colorScheme="blue" 
            onChange={(index) => setActiveTab(index)}
            defaultIndex={0}
          >
            <TabList>
              <Tab>
                <HStack spacing={2}>
                  <FaBox />
                  <Text>Mes engins</Text>
                </HStack>
              </Tab>
              <Tab>
                <HStack spacing={2}>
                  <FaCalendarAlt />
                  <Text>Locations</Text>
                </HStack>
              </Tab>
              <Tab>
                <HStack spacing={2}>
                  <FaChartBar />
                  <Text>Analyses</Text>
                </HStack>
              </Tab>
              <Tab>
                <HStack spacing={2}>
                  <FaCog />
                  <Text>Paramètres</Text>
                </HStack>
              </Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                {/* Contenu de l'onglet "Mes engins" */}
                <SlideFade in={true} offsetY="20px">
                  <Card p={5} mb={6} borderRadius="xl" boxShadow="md">
                    <Stack direction={{ base: "column", md: "row" }} spacing={4} align="center">
                      <FormControl maxW="200px">
                        <FormLabel fontWeight="medium">Catégorie</FormLabel>
                        <Select value={filterCategory} onChange={handleFilterCategoryChange} size="md">
                          <option value="">Toutes</option>
                          {categories.map((cat) => (
                            <option key={cat.value} value={cat.value}>
                              {cat.label}
                            </option>
                          ))}
                        </Select>
                      </FormControl>
                      <FormControl maxW="200px">
                        <FormLabel fontWeight="medium">Trier par</FormLabel>
                        <Select value={sortBy} onChange={handleSortByChange} size="md">
                          <option value="name">Nom</option>
                          <option value="price">Prix</option>
                          <option value="category">Catégorie</option>
                        </Select>
                      </FormControl>
                      <Button
                        leftIcon={<FaPlus />}
                        onClick={handleAddEquipment}
                        colorScheme="blue"
                        size="md"
                        ml={{ base: 0, md: "auto" }}
                        _hover={{ transform: 'translateY(-2px)' }}
                      >
                        Ajouter un engin
                      </Button>
                    </Stack>
                  </Card>
                </SlideFade>

                {/* Liste des engins */}
                {loading ? (
                  <Center py={10}>
                    <Spinner size="xl" color="blue.500" thickness="4px" />
                  </Center>
                ) : (
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={6}>
                    {equipment
                      .filter(e => !filterCategory || e.category === filterCategory)
                      .sort((a, b) => {
                        switch (sortBy) {
                          case 'price':
                            return b.price - a.price;
                          case 'category':
                            return a.category.localeCompare(b.category);
                          default:
                            return a.name.localeCompare(b.name);
                        }
                      })
                      .map((item, index) => (
                        <Card
                          key={item.id}
                          variant="outline"
                          overflow="hidden"
                          transition="all 0.3s"
                          _hover={{
                            transform: 'translateY(-4px)',
                            boxShadow: 'xl',
                          }}
                        >
                          <CardBody p={0}>
                            <Box position="relative">
                              <Image
                                src={item.image || 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'}
                                alt={item.name}
                                objectFit="cover"
                                w="100%"
                                h="200px"
                              />
                              <Badge
                                position="absolute"
                                top={2}
                                right={2}
                                colorScheme={item.isAvailable ? 'green' : 'red'}
                              >
                                {item.isAvailable ? 'Disponible' : 'Indisponible'}
                              </Badge>
                            </Box>
                            <Stack p={4} spacing={3}>
                              <Heading size="md">{item.name}</Heading>
                              <Text color="gray.600" noOfLines={2}>
                                {item.description}
                              </Text>
                              <HStack spacing={2}>
                                <Tag size="sm" colorScheme="blue">
                                  {categories.find(c => c.value === item.category)?.label || item.category}
                                </Tag>
                                <Tag size="sm" colorScheme="purple">
                                  {`${item.price}€/jour`}
                                </Tag>
                              </HStack>
                              <HStack justify="space-between">
                                <IconButton
                                  aria-label="Modifier"
                                  icon={<FaEdit />}
                                  size="sm"
                                  colorScheme="blue"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditEquipment(item);
                                  }}
                                />
                                <IconButton
                                  aria-label="Supprimer"
                                  icon={<FaTrash />}
                                  size="sm"
                                  colorScheme="red"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteEquipment(item.id);
                                  }}
                                />
                              </HStack>
                            </Stack>
                          </CardBody>
                        </Card>
                      ))}
                  </SimpleGrid>
                )}
              </TabPanel>

              <TabPanel>
                {/* Contenu de l'onglet "Locations" */}
                <Card p={5} mb={6} borderRadius="xl" boxShadow="md">
                  <Heading size="md" mb={4}>Locations récentes</Heading>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Client</Th>
                        <Th>Engin</Th>
                        <Th>Date de début</Th>
                        <Th>Date de fin</Th>
                        <Th>Statut</Th>
                        <Th>Montant</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      <Tr>
                        <Td>Jean Dupont</Td>
                        <Td>Pelle mécanique</Td>
                        <Td>15/06/2023</Td>
                        <Td>20/06/2023</Td>
                        <Td>
                          <Badge colorScheme="green">Terminée</Badge>
                        </Td>
                        <Td>1 500€</Td>
                        <Td>
                          <HStack spacing={2}>
                            <IconButton
                              aria-label="Voir détails"
                              icon={<FaEdit />}
                              size="sm"
                              colorScheme="blue"
                            />
                            <IconButton
                              aria-label="Supprimer"
                              icon={<FaTrash />}
                              size="sm"
                              colorScheme="red"
                            />
                          </HStack>
                        </Td>
                      </Tr>
                      <Tr>
                        <Td>Marie Martin</Td>
                        <Td>Bulldozer</Td>
                        <Td>22/06/2023</Td>
                        <Td>25/06/2023</Td>
                        <Td>
                          <Badge colorScheme="yellow">En cours</Badge>
                        </Td>
                        <Td>900€</Td>
                        <Td>
                          <HStack spacing={2}>
                            <IconButton
                              aria-label="Voir détails"
                              icon={<FaEdit />}
                              size="sm"
                              colorScheme="blue"
                            />
                            <IconButton
                              aria-label="Supprimer"
                              icon={<FaTrash />}
                              size="sm"
                              colorScheme="red"
                            />
                          </HStack>
                        </Td>
                      </Tr>
                    </Tbody>
                  </Table>
                </Card>
              </TabPanel>

              <TabPanel>
                {/* Contenu de l'onglet "Analyses" */}
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <Card p={5} borderRadius="xl" boxShadow="md">
                    <Heading size="md" mb={4}>Revenus mensuels</Heading>
                    <Box h="300px" position="relative">
                      {/* Ici, vous pourriez intégrer un graphique avec une bibliothèque comme Chart.js ou Recharts */}
                      <Box 
                        h="100%" 
                        display="flex" 
                        alignItems="flex-end" 
                        justifyContent="space-between"
                      >
                        {[30, 45, 60, 35, 50, 70, 65, 80, 75, 85, 90, 95].map((height, index) => (
                          <Box 
                            key={index} 
                            w="20px" 
                            h={`${height}%`} 
                            bg="blue.500" 
                            borderRadius="md"
                            transition="all 0.3s"
                            _hover={{ transform: 'scaleY(1.1)', bg: 'blue.600' }}
                          />
                        ))}
                      </Box>
                      <HStack 
                        position="absolute" 
                        bottom={-8} 
                        left={0} 
                        right={0} 
                        justify="space-between"
                        px={2}
                      >
                        {['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'].map((month, index) => (
                          <Text key={index} fontSize="xs" color="gray.500">{month}</Text>
                        ))}
                      </HStack>
                    </Box>
                  </Card>
                  <Card p={5} borderRadius="xl" boxShadow="md">
                    <Heading size="md" mb={4}>Engins les plus populaires</Heading>
                    <VStack align="stretch" spacing={4}>
                      <Box>
                        <HStack justify="space-between" mb={1}>
                          <Text fontSize="sm">Pelle mécanique</Text>
                          <Text fontSize="sm" fontWeight="bold">75%</Text>
                        </HStack>
                        <Progress value={75} colorScheme="blue" borderRadius="full" />
                      </Box>
                      <Box>
                        <HStack justify="space-between" mb={1}>
                          <Text fontSize="sm">Bulldozer</Text>
                          <Text fontSize="sm" fontWeight="bold">60%</Text>
                        </HStack>
                        <Progress value={60} colorScheme="green" borderRadius="full" />
                      </Box>
                      <Box>
                        <HStack justify="space-between" mb={1}>
                          <Text fontSize="sm">Grue</Text>
                          <Text fontSize="sm" fontWeight="bold">45%</Text>
                        </HStack>
                        <Progress value={45} colorScheme="orange" borderRadius="full" />
                      </Box>
                      <Box>
                        <HStack justify="space-between" mb={1}>
                          <Text fontSize="sm">Camion-benne</Text>
                          <Text fontSize="sm" fontWeight="bold">30%</Text>
                        </HStack>
                        <Progress value={30} colorScheme="red" borderRadius="full" />
                      </Box>
                    </VStack>
                  </Card>
                </SimpleGrid>
              </TabPanel>

              <TabPanel>
                {/* Contenu de l'onglet "Paramètres" */}
                <Card p={5} borderRadius="xl" boxShadow="md">
                  <Heading size="md" mb={4}>Paramètres du compte</Heading>
                  <Accordion allowMultiple>
                    <AccordionItem>
                      <h2>
                        <AccordionButton>
                          <Box flex="1" textAlign="left">
                            <HStack>
                              <FaUserCog />
                              <Text fontWeight="medium">Informations du profil</Text>
                            </HStack>
                          </Box>
                          <AccordionIcon />
                        </AccordionButton>
                      </h2>
                      <AccordionPanel pb={4}>
                        <VStack align="stretch" spacing={4}>
                          <FormControl>
                            <FormLabel>Nom de l'entreprise</FormLabel>
                            <Input defaultValue="Entreprise ABC" />
                          </FormControl>
                          <FormControl>
                            <FormLabel>Adresse</FormLabel>
                            <Input defaultValue="123 Rue de la Construction" />
                          </FormControl>
                          <FormControl>
                            <FormLabel>Téléphone</FormLabel>
                            <Input defaultValue="01 23 45 67 89" />
                          </FormControl>
                          <Button colorScheme="blue" alignSelf="flex-start">
                            Enregistrer les modifications
                          </Button>
                        </VStack>
                      </AccordionPanel>
                    </AccordionItem>

                    <AccordionItem>
                      <h2>
                        <AccordionButton>
                          <Box flex="1" textAlign="left">
                            <HStack>
                              <FaShieldAlt />
                              <Text fontWeight="medium">Sécurité</Text>
                            </HStack>
                          </Box>
                          <AccordionIcon />
                        </AccordionButton>
                      </h2>
                      <AccordionPanel pb={4}>
                        <VStack align="stretch" spacing={4}>
                          <FormControl>
                            <FormLabel>Changer le mot de passe</FormLabel>
                            <Input type="password" placeholder="Nouveau mot de passe" />
                          </FormControl>
                          <FormControl>
                            <FormLabel>Confirmer le mot de passe</FormLabel>
                            <Input type="password" placeholder="Confirmer le mot de passe" />
                          </FormControl>
                          <Button colorScheme="blue" alignSelf="flex-start">
                            Mettre à jour le mot de passe
                          </Button>
                        </VStack>
                      </AccordionPanel>
                    </AccordionItem>

                    <AccordionItem>
                      <h2>
                        <AccordionButton>
                          <Box flex="1" textAlign="left">
                            <HStack>
                              <FaBell />
                              <Text fontWeight="medium">Notifications</Text>
                            </HStack>
                          </Box>
                          <AccordionIcon />
                        </AccordionButton>
                      </h2>
                      <AccordionPanel pb={4}>
                        <VStack align="stretch" spacing={4}>
                          <FormControl display="flex" alignItems="center">
                            <FormLabel mb="0">
                              Notifications par email
                            </FormLabel>
                            <Switch defaultChecked />
                          </FormControl>
                          <FormControl display="flex" alignItems="center">
                            <FormLabel mb="0">
                              Notifications push
                            </FormLabel>
                            <Switch defaultChecked />
                          </FormControl>
                          <FormControl display="flex" alignItems="center">
                            <FormLabel mb="0">
                              Rappels de maintenance
                            </FormLabel>
                            <Switch defaultChecked />
                          </FormControl>
                        </VStack>
                      </AccordionPanel>
                    </AccordionItem>
                  </Accordion>
                </Card>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      )}

      {/* Affichage standard pour les clients */}
      {!isProUser && !isBusinessUser && (
        <>
          {/* Filtres et tri */}
          <SlideFade in={true} offsetY="20px">
            <Card p={5} mb={6} borderRadius="lg" boxShadow="md">
              <Stack direction={{ base: "column", md: "row" }} spacing={4} align="center">
                <FormControl maxW="200px">
                  <FormLabel fontWeight="medium">Catégorie</FormLabel>
                  <Select value={filterCategory} onChange={handleFilterCategoryChange} size="md">
                    <option value="">Toutes</option>
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl maxW="200px">
                  <FormLabel fontWeight="medium">Trier par</FormLabel>
                  <Select value={sortBy} onChange={handleSortByChange} size="md">
                    <option value="name">Nom</option>
                    <option value="price">Prix</option>
                    <option value="category">Catégorie</option>
                  </Select>
                </FormControl>
                <Button
                  leftIcon={<FaPlus />}
                  onClick={handleAddEquipment}
                  colorScheme="blue"
                  size="md"
                  ml={{ base: 0, md: "auto" }}
                  _hover={{ transform: 'translateY(-2px)' }}
                >
                  Ajouter un engin
                </Button>
              </Stack>
            </Card>
          </SlideFade>

          {/* Liste des engins */}
          {loading ? (
            <Center py={10}>
              <Spinner size="xl" color="blue.500" thickness="4px" />
            </Center>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={6}>
              {equipment
                .filter(e => !filterCategory || e.category === filterCategory)
                .sort((a, b) => {
                  switch (sortBy) {
                    case 'price':
                      return b.price - a.price;
                    case 'category':
                      return a.category.localeCompare(b.category);
                    default:
                      return a.name.localeCompare(b.name);
                  }
                })
                .map((item, index) => (
                  <Card
                    key={item.id}
                    variant="outline"
                    overflow="hidden"
                    transition="all 0.3s"
                    _hover={{
                      transform: 'translateY(-4px)',
                      boxShadow: 'xl',
                    }}
                  >
                    <CardBody p={0}>
                      <Box position="relative">
                        <Image
                          src={item.image || 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'}
                          alt={item.name}
                          objectFit="cover"
                          w="100%"
                          h="200px"
                        />
                        <Badge
                          position="absolute"
                          top={2}
                          right={2}
                          colorScheme={item.isAvailable ? 'green' : 'red'}
                        >
                          {item.isAvailable ? 'Disponible' : 'Indisponible'}
                        </Badge>
                      </Box>
                      <Stack p={4} spacing={3}>
                        <Heading size="md">{item.name}</Heading>
                        <Text color="gray.600" noOfLines={2}>
                          {item.description}
                        </Text>
                        <HStack spacing={2}>
                          <Tag size="sm" colorScheme="blue">
                            {categories.find(c => c.value === item.category)?.label || item.category}
                          </Tag>
                          <Tag size="sm" colorScheme="purple">
                            {`${item.price}€/jour`}
                          </Tag>
                        </HStack>
                        <HStack justify="space-between">
                          <IconButton
                            aria-label="Modifier"
                            icon={<FaEdit />}
                            size="sm"
                            colorScheme="blue"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditEquipment(item);
                            }}
                          />
                          <IconButton
                            aria-label="Supprimer"
                            icon={<FaTrash />}
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteEquipment(item.id);
                            }}
                          />
                        </HStack>
                      </Stack>
                    </CardBody>
                  </Card>
                ))}
            </SimpleGrid>
          )}
        </>
      )}

      {/* Modal pour ajouter/modifier un engin */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedEquipment ? 'Modifier l\'engin' : 'Ajouter un nouvel engin'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {localError && (
              <Alert status="error" mb={4}>
                <AlertIcon />
                {localError}
              </Alert>
            )}
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Nom de l'engin</FormLabel>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ex: Pelle mécanique JCB"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Description</FormLabel>
                <Input
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Description détaillée de l'engin"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Prix par jour (€)</FormLabel>
                <Input
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="Ex: 150"
                  type="number"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Catégorie</FormLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Image URL</FormLabel>
                <Input
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  placeholder="URL de l'image"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Localisation</FormLabel>
                <Input
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Ex: Paris, France"
                />
              </FormControl>
              <Divider />
              <Heading size="sm" alignSelf="flex-start">
                Spécifications techniques
              </Heading>
              {specificationFields.map((field) => (
                <FormControl key={field}>
                  <FormLabel>{field.charAt(0).toUpperCase() + field.slice(1)}</FormLabel>
                  <Input
                    name={`specifications.${field}`}
                    value={formData.specifications[field] || ''}
                    onChange={handleInputChange}
                    placeholder={`Ex: ${field}`}
                  />
                </FormControl>
              ))}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Annuler
            </Button>
            <Button colorScheme="blue" onClick={handleSubmit}>
              {selectedEquipment ? 'Mettre à jour' : 'Ajouter'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Mise à jour des liens dans le menu utilisateur */}
      <Menu>
        <MenuButton
          as={Button}
          variant="ghost"
          size="sm"
          rightIcon={<FaEllipsisV />}
        >
          <HStack spacing={2}>
            <Avatar size="sm" name={`${user?.firstName || ''} ${user?.lastName || ''}`} />
            <Text display={{ base: 'none', md: 'block' }}>{`${user?.firstName || ''} ${user?.lastName || ''}`}</Text>
          </HStack>
        </MenuButton>
        <MenuList>
          <MenuItem icon={<FaUserCog />} onClick={() => navigate('/profile')}>
            Mon profil
          </MenuItem>
          <MenuItem icon={<FaClipboardList />} onClick={() => navigate('/my-rentals')}>
            Mes locations
          </MenuItem>
          <MenuItem icon={<FaCalendarCheck />} onClick={() => navigate('/calendar')}>
            Calendrier
          </MenuItem>
          <MenuDivider />
          <MenuItem icon={<FaCog />} onClick={() => navigate('/settings')}>
            Paramètres
          </MenuItem>
          <MenuItem icon={<FaShieldAlt />} onClick={() => navigate('/security')}>
            Sécurité
          </MenuItem>
          <MenuDivider />
          <MenuItem icon={<FaHistory />} onClick={() => navigate('/history')}>
            Historique
          </MenuItem>
          <MenuItem icon={<FaFileExport />} onClick={() => navigate('/export')}>
            Exporter mes données
          </MenuItem>
          <MenuDivider />
          <MenuItem icon={<FaBell />} onClick={() => navigate('/notifications')}>
            Notifications
          </MenuItem>
          <MenuDivider />
          <MenuItem icon={<FaExclamationTriangle />} color="red.500" onClick={() => navigate('/logout')}>
            Déconnexion
          </MenuItem>
        </MenuList>
      </Menu>

      {/* Mise à jour des liens dans le menu de navigation */}
      <HStack spacing={4} display={{ base: 'none', md: 'flex' }}>
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
          Tableau de bord
        </Button>
        <Button variant="ghost" size="sm" onClick={() => navigate('/equipment')}>
          Engins
        </Button>
        <Button variant="ghost" size="sm" onClick={() => navigate('/rentals')}>
          Locations
        </Button>
        <Button variant="ghost" size="sm" onClick={() => navigate('/calendar')}>
          Calendrier
        </Button>
        <Button variant="ghost" size="sm" onClick={() => navigate('/profile')}>
          Profil
        </Button>
      </HStack>

      {/* Mise à jour des liens dans le menu mobile */}
      <Drawer isOpen={isFilterDrawerOpen} placement="left" onClose={() => setIsFilterDrawerOpen(false)}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Menu</DrawerHeader>
          <DrawerBody>
            <VStack spacing={4} align="stretch">
              <Button variant="ghost" justifyContent="flex-start" leftIcon={<FaBox />} onClick={() => navigate('/dashboard')}>
                Tableau de bord
              </Button>
              <Button variant="ghost" justifyContent="flex-start" leftIcon={<FaList />} onClick={() => navigate('/equipment')}>
                Engins
              </Button>
              <Button variant="ghost" justifyContent="flex-start" leftIcon={<FaCalendarAlt />} onClick={() => navigate('/rentals')}>
                Locations
              </Button>
              <Button variant="ghost" justifyContent="flex-start" leftIcon={<FaCalendarCheck />} onClick={() => navigate('/calendar')}>
                Calendrier
              </Button>
              <Button variant="ghost" justifyContent="flex-start" leftIcon={<FaUserCog />} onClick={() => navigate('/profile')}>
                Profil
              </Button>
              <Button variant="ghost" justifyContent="flex-start" leftIcon={<FaCog />} onClick={() => navigate('/settings')}>
                Paramètres
              </Button>
              <Button variant="ghost" justifyContent="flex-start" leftIcon={<FaBell />} onClick={() => navigate('/notifications')}>
                Notifications
              </Button>
              <Button variant="ghost" justifyContent="flex-start" leftIcon={<FaHistory />} onClick={() => navigate('/history')}>
                Historique
              </Button>
              <Button variant="ghost" justifyContent="flex-start" leftIcon={<FaExclamationTriangle />} color="red.500" onClick={() => navigate('/logout')}>
                Déconnexion
              </Button>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default Dashboard; 