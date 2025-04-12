import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Container,
  Grid,
  Heading,
  Text,
  Button,
  Input,
  FormControl,
  FormLabel,
  Select,
  useColorModeValue,
  VStack,
  HStack,
  Divider,
  useBreakpointValue,
  Spinner,
  Alert,
  AlertIcon,
  Icon,
  SimpleGrid,
  Flex,
  Badge,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Image,
  Tag,
  TagLabel,
  TagLeftIcon,
  useToast,
  Tooltip,
  Collapse,
  IconButton,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Wrap,
  WrapItem,
  Center,
  Switch,
  FormHelperText,
  Radio,
  RadioGroup,
  Stack,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Checkbox,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Textarea,
} from '@chakra-ui/react';
import { SearchIcon, ChevronDownIcon, ChevronUpIcon, StarIcon, ViewIcon, ViewOffIcon, DownloadIcon, ViewIcon as MapIcon, ViewIcon as GridIcon } from '@chakra-ui/icons';
import { FaFilter, FaTag, FaEuroSign, FaExclamationTriangle, FaChevronLeft, FaChevronRight, FaTruck, FaTools, FaMapMarkerAlt, FaHeart, FaRegHeart, FaExchangeAlt, FaBell, FaHistory, FaFileExport, FaThLarge, FaList, FaMapMarkedAlt, FaFilter as FaFilterAlt, FaCheckCircle, FaStar, FaRegStar } from 'react-icons/fa';
import { RootState } from '../store';
import { EquipmentState, setEquipment } from '../store/slices/equipmentSlice';
import { getEquipments } from '../services/equipmentService';
import EquipmentCard from '../components/EquipmentCard';
import { Equipment, User, Rating } from '../types';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { addRating } from '../services/ratingService';

interface ViewMode {
  type: 'grid' | 'list' | 'map';
}

interface FavoriteEquipment {
  id: string;
  dateAdded: Date;
}

interface EquipmentComparison {
  equipmentIds: string[];
}

interface SearchHistory {
  query: string;
  timestamp: Date;
}

interface EquipmentWithRatings extends Equipment {
  ratings?: Rating[];
  averageRating?: number;
}

// Icône personnalisée pour la carte
const customIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const EquipmentList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();
  const { items: equipment, loading, error } = useSelector((state: RootState) => (state.equipment as EquipmentState));
  const { user } = useSelector((state: RootState) => state.auth);
  const isMobile = useBreakpointValue({ base: true, md: false });
  const [showFilters, setShowFilters] = useState(!isMobile);
  const [viewMode, setViewMode] = useState<ViewMode>({ type: 'grid' });
  const [favorites, setFavorites] = useState<FavoriteEquipment[]>([]);
  const [compareItems, setCompareItems] = useState<Equipment[]>([]);
  const [showMap, setShowMap] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationPreferences, setNotificationPreferences] = useState({
    email: true,
    push: false
  });
  
  // Modals
  const { isOpen: isCompareOpen, onOpen: onCompareOpen, onClose: onCompareClose } = useDisclosure();
  const { isOpen: isNotificationOpen, onOpen: onNotificationOpen, onClose: onNotificationClose } = useDisclosure();
  const { isOpen: isExportOpen, onOpen: onExportOpen, onClose: onExportClose } = useDisclosure();
  const { isOpen: isHistoryOpen, onOpen: onHistoryOpen, onClose: onHistoryClose } = useDisclosure();
  const { isOpen: isRatingModalOpen, onOpen: onRatingOpen, onClose: onRatingClose } = useDisclosure();

  const [filters, setFilters] = useState({
    search: '',
    category: '',
    priceRange: '',
    availability: '',
    sortBy: 'name',
    sortOrder: 'asc',
    location: '',
    specifications: {
      poids: '',
      puissance: '',
      annee: ''
    }
  });

  const [categories] = useState([
    'Pelle mécanique',
    'Chargeuse',
    'Niveleuse',
    'Bulldozer',
    'Grue',
    'Camion-benne',
    'Compacteur',
    'Autre'
  ]);

  const [priceRanges] = useState([
    { label: 'Tous les prix', value: '' },
    { label: 'Moins de 100€/jour', value: '100' },
    { label: '100€ - 200€/jour', value: '200' },
    { label: '200€ - 500€/jour', value: '500' },
    { label: 'Plus de 500€/jour', value: '1000' }
  ]);

  const [page, setPage] = useState(1);
  const itemsPerPage = 9;

  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentWithRatings | null>(null);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState('');

  // Charger les favoris depuis le localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
    
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
    
    const savedViewMode = localStorage.getItem('viewMode');
    if (savedViewMode) {
      setViewMode({ type: savedViewMode as 'grid' | 'list' | 'map' });
    }
  }, []);

  // Sauvegarder les favoris dans le localStorage
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Sauvegarder les recherches récentes
  useEffect(() => {
    localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
  }, [recentSearches]);

  // Sauvegarder le mode d'affichage
  useEffect(() => {
    localStorage.setItem('viewMode', viewMode.type);
  }, [viewMode]);

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const equipmentData = await getEquipments();
        dispatch(setEquipment(equipmentData));
      } catch (err) {
        console.error('Erreur lors du chargement des équipements:', err);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les équipements',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };

    fetchEquipment();
  }, [dispatch, toast]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setPage(1);
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setPage(1);
  };

  const handleSpecificationChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [key]: value,
      },
    }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      category: '',
      priceRange: '',
      availability: '',
      sortBy: 'name',
      sortOrder: 'asc',
      location: '',
      specifications: {
        poids: '',
        puissance: '',
        annee: ''
      }
    });
    setPage(1);
  };

  const toggleFavorite = (equipmentId: string) => {
    const isFavorite = favorites.some(fav => fav.id === equipmentId);
    if (isFavorite) {
      setFavorites(favorites.filter(fav => fav.id !== equipmentId));
      toast({
        title: "Retiré des favoris",
        status: "info",
        duration: 2000,
      });
    } else {
      setFavorites([...favorites, { id: equipmentId, dateAdded: new Date() }]);
      toast({
        title: "Ajouté aux favoris",
        status: "success",
        duration: 2000,
      });
    }
  };

  const addToCompare = (item: Equipment) => {
    if (compareItems.length >= 3) {
      toast({
        title: 'Limite atteinte',
        description: 'Vous ne pouvez comparer que 3 équipements maximum',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    if (compareItems.some((i) => i.id === item.id)) {
      toast({
        title: 'Déjà ajouté',
        description: 'Cet équipement est déjà dans la comparaison',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setCompareItems((prev) => [...prev, item]);
    toast({
      title: 'Ajouté à la comparaison',
      description: `${item.name} a été ajouté à la comparaison`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const removeFromCompare = (id: string) => {
    setCompareItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCompare = () => {
    setCompareItems([]);
  };

  const handleSearch = () => {
    if (filters.search && !recentSearches.includes(filters.search)) {
      setRecentSearches((prev) => [filters.search, ...prev].slice(0, 5));
    }
  };

  const handleExport = (format: 'pdf' | 'excel') => {
    toast({
      title: 'Exportation',
      description: `Exportation en ${format.toUpperCase()} en cours...`,
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
    // Logique d'exportation à implémenter
    onExportClose();
  };

  const handleNotificationToggle = (type: 'email' | 'push') => {
    setNotificationPreferences((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const handleNotificationSave = () => {
    toast({
      title: 'Préférences sauvegardées',
      description: 'Vos préférences de notification ont été enregistrées',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    onNotificationClose();
  };

  const handleRating = async (equipmentId: string) => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour laisser un avis",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    try {
      const newRating: Rating = {
        userId: user.id,
        equipmentId,
        rating: userRating,
        comment: userComment,
        createdAt: new Date(),
      };

      await addRating(equipmentId, newRating);

      toast({
        title: "Avis enregistré",
        description: "Merci pour votre avis !",
        status: "success",
        duration: 3000,
      });

      // Rafraîchir la liste des équipements pour mettre à jour les notes
      const equipmentData = await getEquipments();
      dispatch(setEquipment(equipmentData));

      onRatingClose();
      setUserRating(0);
      setUserComment('');
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'avis:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement de votre avis",
        status: "error",
        duration: 3000,
      });
    }
  };

  const filteredEquipment = equipment.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                         item.description.toLowerCase().includes(filters.search.toLowerCase());
    const matchesCategory = !filters.category || item.category === filters.category;
    const matchesPrice = !filters.priceRange || item.price <= parseInt(filters.priceRange);
    const matchesAvailability = !filters.availability || 
                              (filters.availability === 'available' && item.isAvailable) ||
                              (filters.availability === 'unavailable' && !item.isAvailable);
    const matchesLocation = !filters.location || 
                          (item.location && item.location.toLowerCase().includes(filters.location.toLowerCase()));
    const matchesSpecifications = !filters.specifications.poids || 
                                (item.specifications?.poids && item.specifications.poids.includes(filters.specifications.poids));
    const matchesFavorites = !showFavorites || favorites.some(fav => fav.id === item.id);
    
    return matchesSearch && matchesCategory && matchesPrice && matchesAvailability && 
           matchesLocation && matchesSpecifications && matchesFavorites;
  }).sort((a, b) => {
    const order = filters.sortOrder === 'asc' ? 1 : -1;
    switch (filters.sortBy) {
      case 'price':
        return (a.price - b.price) * order;
      case 'name':
        return a.name.localeCompare(b.name) * order;
      case 'category':
        return a.category.localeCompare(b.category) * order;
      default:
        return 0;
    }
  });

  const paginatedEquipment = filteredEquipment.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const headingColor = useColorModeValue('gray.800', 'white');
  const cardBg = useColorModeValue('white', 'gray.800');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      {/* En-tête */}
      <Box 
        bg={useColorModeValue('white', 'gray.800')} 
        py={8} 
        px={4} 
        borderBottom="1px" 
        borderColor={borderColor}
        position="relative"
        overflow="hidden"
      >
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          height="100%"
          bgGradient="linear(to-r, blue.50, purple.50)"
          opacity={useColorModeValue(0.3, 0.1)}
          zIndex={0}
        />
        <Container maxW="container.xl" position="relative" zIndex={1}>
          <VStack spacing={4} align="center" textAlign="center">
            <Heading
              as="h1"
              size="xl"
              bgGradient="linear(to-r, blue.400, purple.500)"
              bgClip="text"
              fontWeight="extrabold"
              letterSpacing="tight"
            >
              Équipements disponibles
            </Heading>
            <Text fontSize="lg" color={textColor} maxW="xl">
              Découvrez notre sélection d'équipements de qualité pour tous vos projets
            </Text>
          </VStack>
        </Container>
      </Box>

      {/* Contenu principal */}
      <Container maxW="container.xl" py={8}>
        <Grid templateColumns={{ base: '1fr', lg: '300px 1fr' }} gap={8}>
          {/* Filtres */}
          <Box>
            <Card
              bg={bgColor}
              borderRadius="xl"
              boxShadow="lg"
              borderWidth="1px"
              borderColor={borderColor}
            >
              <CardHeader>
                <HStack justify="space-between">
                  <HStack>
                    <FaFilter color="blue.500" />
                    <Heading size="md">Filtres</Heading>
                  </HStack>
                  {isMobile && (
                    <IconButton
                      aria-label="Toggle filters"
                      icon={showFilters ? <ChevronUpIcon /> : <ChevronDownIcon />}
                      onClick={() => setShowFilters(!showFilters)}
                      variant="ghost"
                    />
                  )}
                </HStack>
              </CardHeader>
              <Collapse in={showFilters}>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <FormControl>
                      <FormLabel>Rechercher</FormLabel>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none">
                          <SearchIcon color="blue.400" />
                        </InputLeftElement>
                        <Input
                          name="search"
                          value={filters.search}
                          onChange={handleTextChange}
                          placeholder="Rechercher un équipement..."
                          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                      </InputGroup>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Catégorie</FormLabel>
                      <Select
                        name="category"
                        value={filters.category}
                        onChange={handleSelectChange}
                        placeholder="Toutes les catégories"
                      >
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Prix maximum</FormLabel>
                      <Select
                        name="priceRange"
                        value={filters.priceRange}
                        onChange={handleSelectChange}
                        placeholder="Tous les prix"
                      >
                        {priceRanges.map((range) => (
                          <option key={range.value} value={range.value}>
                            {range.label}
                          </option>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Disponibilité</FormLabel>
                      <Select
                        name="availability"
                        value={filters.availability}
                        onChange={handleSelectChange}
                        placeholder="Tous les statuts"
                      >
                        <option value="">Tous les statuts</option>
                        <option value="available">Disponible</option>
                        <option value="unavailable">Non disponible</option>
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Localisation</FormLabel>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none">
                          <FaMapMarkerAlt color="blue.400" />
                        </InputLeftElement>
                        <Input
                          name="location"
                          value={filters.location}
                          onChange={handleTextChange}
                          placeholder="Entrez une ville ou région"
                        />
                      </InputGroup>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Poids</FormLabel>
                      <Input
                        name="specifications.poids"
                        value={filters.specifications.poids}
                        onChange={(e) => handleSpecificationChange('poids', e.target.value)}
                        placeholder="Filtrer par poids"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Puissance</FormLabel>
                      <Input
                        name="specifications.puissance"
                        value={filters.specifications.puissance}
                        onChange={(e) => handleSpecificationChange('puissance', e.target.value)}
                        placeholder="Filtrer par puissance"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Année</FormLabel>
                      <Input
                        name="specifications.annee"
                        value={filters.specifications.annee}
                        onChange={(e) => handleSpecificationChange('annee', e.target.value)}
                        placeholder="Filtrer par année"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Trier par</FormLabel>
                      <Select
                        name="sortBy"
                        value={filters.sortBy}
                        onChange={handleSelectChange}
                      >
                        <option value="name">Nom</option>
                        <option value="price">Prix</option>
                        <option value="category">Catégorie</option>
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Ordre</FormLabel>
                      <Select
                        name="sortOrder"
                        value={filters.sortOrder}
                        onChange={handleSelectChange}
                      >
                        <option value="asc">Croissant</option>
                        <option value="desc">Décroissant</option>
                      </Select>
                    </FormControl>

                    <FormControl display="flex" alignItems="center">
                      <FormLabel htmlFor="show-favorites" mb="0">
                        Afficher uniquement les favoris
                      </FormLabel>
                      <Switch 
                        id="show-favorites" 
                        isChecked={showFavorites}
                        onChange={() => setShowFavorites(!showFavorites)}
                        colorScheme="blue"
                      />
                    </FormControl>

                    <Button
                      colorScheme="blue"
                      variant="outline"
                      onClick={resetFilters}
                      leftIcon={<FaFilter />}
                    >
                      Réinitialiser les filtres
                    </Button>
                  </VStack>
                </CardBody>
              </Collapse>
            </Card>

            {/* Filtres rapides */}
            <Card
              mt={4}
              bg={bgColor}
              borderRadius="xl"
              boxShadow="lg"
              borderWidth="1px"
              borderColor={borderColor}
            >
              <CardHeader>
                <HStack>
                  <FaFilterAlt color="blue.500" />
                  <Heading size="md">Filtres rapides</Heading>
                </HStack>
              </CardHeader>
              <CardBody>
                <Wrap spacing={2}>
                  {categories.slice(0, 4).map((category) => (
                    <WrapItem key={category}>
                      <Tag
                        size="md"
                        colorScheme="blue"
                        borderRadius="full"
                        cursor="pointer"
                        onClick={() => setFilters(prev => ({ ...prev, category }))}
                        _hover={{ bg: 'blue.600' }}
                      >
                        <TagLeftIcon boxSize="12px" as={FaTools} />
                        <TagLabel>{category}</TagLabel>
                      </Tag>
                    </WrapItem>
                  ))}
                  <WrapItem>
                    <Tag
                      size="md"
                      colorScheme="green"
                      borderRadius="full"
                      cursor="pointer"
                      onClick={() => setFilters(prev => ({ ...prev, availability: 'available' }))}
                      _hover={{ bg: 'green.600' }}
                    >
                      <TagLeftIcon boxSize="12px" as={FaCheckCircle} />
                      <TagLabel>Disponibles</TagLabel>
                    </Tag>
                  </WrapItem>
                  <WrapItem>
                    <Tag
                      size="md"
                      colorScheme="purple"
                      borderRadius="full"
                      cursor="pointer"
                      onClick={() => setShowFavorites(true)}
                      _hover={{ bg: 'purple.600' }}
                    >
                      <TagLeftIcon boxSize="12px" as={FaHeart} />
                      <TagLabel>Favoris</TagLabel>
                    </Tag>
                  </WrapItem>
                </Wrap>
              </CardBody>
            </Card>
          </Box>

          {/* Liste des équipements */}
          <Box>
            {/* Barre d'outils */}
            <Flex 
              mb={4} 
              justify="space-between" 
              align="center"
              flexWrap="wrap"
              gap={2}
            >
              <HStack spacing={2}>
                <Button
                  size="sm"
                  variant={viewMode.type === 'grid' ? 'solid' : 'outline'}
                  colorScheme="blue"
                  leftIcon={<GridIcon />}
                  onClick={() => setViewMode({ type: 'grid' })}
                >
                  Grille
                </Button>
                <Button
                  size="sm"
                  variant={viewMode.type === 'list' ? 'solid' : 'outline'}
                  colorScheme="blue"
                  leftIcon={<FaList />}
                  onClick={() => setViewMode({ type: 'list' })}
                >
                  Liste
                </Button>
                <Button
                  size="sm"
                  variant={viewMode.type === 'map' ? 'solid' : 'outline'}
                  colorScheme="blue"
                  leftIcon={<MapIcon />}
                  onClick={() => setViewMode({ type: 'map' })}
                >
                  Carte
                </Button>
              </HStack>
              
              <HStack spacing={2}>
                <Tooltip label="Favoris">
                  <IconButton
                    aria-label="Favoris"
                    icon={<FaHeart color={showFavorites ? 'red' : 'gray'} />}
                    onClick={() => setShowFavorites(!showFavorites)}
                    variant="outline"
                    colorScheme={showFavorites ? 'red' : 'gray'}
                  />
                </Tooltip>
                <Tooltip label="Comparer">
                  <IconButton
                    aria-label="Comparer"
                    icon={<FaExchangeAlt />}
                    onClick={onCompareOpen}
                    variant="outline"
                    colorScheme="blue"
                    isDisabled={compareItems.length === 0}
                  />
                </Tooltip>
                <Tooltip label="Notifications">
                  <IconButton
                    aria-label="Notifications"
                    icon={<FaBell />}
                    onClick={onNotificationOpen}
                    variant="outline"
                    colorScheme="blue"
                  />
                </Tooltip>
                <Tooltip label="Historique">
                  <IconButton
                    aria-label="Historique"
                    icon={<FaHistory />}
                    onClick={onHistoryOpen}
                    variant="outline"
                    colorScheme="blue"
                  />
                </Tooltip>
                <Tooltip label="Exporter">
                  <IconButton
                    aria-label="Exporter"
                    icon={<DownloadIcon />}
                    onClick={onExportOpen}
                    variant="outline"
                    colorScheme="blue"
                  />
                </Tooltip>
              </HStack>
            </Flex>

            {loading ? (
              <Flex justify="center" align="center" minH="400px">
                <Spinner size="xl" color="blue.500" thickness="4px" />
              </Flex>
            ) : error ? (
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                <Text>Erreur lors du chargement des équipements: {error}</Text>
              </Alert>
            ) : paginatedEquipment.length === 0 ? (
              <Card
                bg={bgColor}
                borderRadius="xl"
                boxShadow="lg"
                p={8}
                textAlign="center"
              >
                <FaExclamationTriangle size={40} color="gray.400" />
                <Heading size="md" mt={4} color={headingColor}>
                  Aucun équipement trouvé
                </Heading>
                <Text mt={2} color={textColor}>
                  Essayez de modifier vos filtres de recherche
                </Text>
                <Button
                  mt={4}
                  colorScheme="blue"
                  onClick={resetFilters}
                >
                  Réinitialiser les filtres
                </Button>
              </Card>
            ) : (
              <VStack spacing={6} align="stretch">
                <Flex justify="space-between" align="center">
                  <Text color={textColor}>
                    {filteredEquipment.length} équipement{filteredEquipment.length !== 1 ? 's' : ''} trouvé{filteredEquipment.length !== equipment.length ? 's' : ''}
                  </Text>
                  <HStack spacing={2}>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                      isDisabled={page === 1}
                      leftIcon={<Icon as={FaChevronLeft} />}
                    >
                      Précédent
                    </Button>
                    <Text fontWeight="medium">
                      Page {page} sur {Math.ceil(filteredEquipment.length / itemsPerPage)}
                    </Text>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPage(prev => Math.min(prev + 1, Math.ceil(filteredEquipment.length / itemsPerPage)))}
                      isDisabled={page === Math.ceil(filteredEquipment.length / itemsPerPage)}
                      rightIcon={<Icon as={FaChevronRight} />}
                    >
                      Suivant
                    </Button>
                  </HStack>
                </Flex>

                {viewMode.type === 'grid' && (
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                    {paginatedEquipment.map((item) => (
                      <Box
                        key={item.id}
                        transition="all 0.3s ease"
                        _hover={{
                          transform: "translateY(-5px)",
                        }}
                      >
                        <EquipmentCard
                          equipment={item}
                          onView={() => navigate(`/equipment/${item.id}`)}
                          user={user}
                          isFavorite={favorites.some(fav => fav.id === item.id)}
                          onToggleFavorite={() => toggleFavorite(item.id)}
                          onAddToCompare={() => addToCompare(item)}
                          onRate={() => {
                            setSelectedEquipment(item);
                            onRatingOpen();
                          }}
                        />
                      </Box>
                    ))}
                  </SimpleGrid>
                )}

                {viewMode.type === 'list' && (
                  <VStack spacing={4} align="stretch">
                    {paginatedEquipment.map((item) => (
                      <Card
                        key={item.id}
                        bg={cardBg}
                        borderRadius="lg"
                        boxShadow="md"
                        transition="all 0.3s ease"
                        _hover={{
                          boxShadow: "lg",
                          transform: "translateY(-2px)",
                          bg: hoverBg,
                        }}
                      >
                        <CardBody>
                          <Grid templateColumns={{ base: '1fr', md: '200px 1fr auto' }} gap={4}>
                            <Box>
                              <Image
                                src={item.image || 'https://via.placeholder.com/200x150?text=Equipment'}
                                alt={item.name}
                                borderRadius="md"
                                objectFit="cover"
                                height="150px"
                                width="100%"
                              />
                            </Box>
                            <VStack align="start" spacing={2}>
                              <Heading size="md">{item.name}</Heading>
                              <Text noOfLines={2}>{item.description}</Text>
                              <HStack>
                                <Badge colorScheme="blue">{item.category}</Badge>
                                <Badge colorScheme={item.isAvailable ? 'green' : 'red'}>
                                  {item.isAvailable ? 'Disponible' : 'Non disponible'}
                                </Badge>
                              </HStack>
                              <HStack>
                                <Icon as={FaEuroSign} color="green.500" />
                                <Text fontWeight="bold">{item.price} €/jour</Text>
                              </HStack>
                            </VStack>
                            <VStack spacing={2} justify="center">
                              <Button
                                colorScheme="blue"
                                size="sm"
                                onClick={() => navigate(`/equipment/${item.id}`)}
                              >
                                Voir détails
                              </Button>
                              <IconButton
                                aria-label="Favoris"
                                icon={favorites.some(fav => fav.id === item.id) ? <FaHeart color="red" /> : <FaRegHeart />}
                                onClick={() => toggleFavorite(item.id)}
                                variant="outline"
                                size="sm"
                              />
                              <IconButton
                                aria-label="Comparer"
                                icon={<FaExchangeAlt />}
                                onClick={() => addToCompare(item)}
                                variant="outline"
                                size="sm"
                                isDisabled={compareItems.some(i => i.id === item.id)}
                              />
                            </VStack>
                          </Grid>
                        </CardBody>
                      </Card>
                    ))}
                  </VStack>
                )}

                {viewMode.type === 'map' && (
                  <Box height="600px" bg={cardBg} borderRadius="lg" boxShadow="md" overflow="hidden">
                    <MapContainer
                      center={[46.603354, 1.888334]} // Centre de la France
                      zoom={6}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      {paginatedEquipment.map((item) => (
                        item.location && (
                          <Marker
                            key={item.id}
                            position={[
                              parseFloat(item.location.split(',')[0]),
                              parseFloat(item.location.split(',')[1])
                            ]}
                            icon={customIcon}
                          >
                            <Popup>
                              <VStack align="start" spacing={2}>
                                <Heading size="sm">{item.name}</Heading>
                                <Text fontSize="sm">{item.description}</Text>
                                <HStack>
                                  <Icon as={FaEuroSign} color="green.500" />
                                  <Text fontWeight="bold">{item.price} €/jour</Text>
                                </HStack>
                                <Button
                                  size="sm"
                                  colorScheme="blue"
                                  onClick={() => navigate(`/equipment/${item.id}`)}
                                >
                                  Voir détails
                                </Button>
                              </VStack>
                            </Popup>
                          </Marker>
                        )
                      ))}
                    </MapContainer>
                  </Box>
                )}
              </VStack>
            )}
          </Box>
        </Grid>
      </Container>

      {/* Modal de comparaison */}
      <Modal isOpen={isCompareOpen} onClose={onCompareClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Comparer les équipements</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {compareItems.length === 0 ? (
              <Text>Ajoutez des équipements à comparer</Text>
            ) : (
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Caractéristique</Th>
                    {compareItems.map((item) => (
                      <Th key={item.id}>{item.name}</Th>
                    ))}
                  </Tr>
                </Thead>
                <Tbody>
                  <Tr>
                    <Td fontWeight="bold">Catégorie</Td>
                    {compareItems.map((item) => (
                      <Td key={item.id}>{item.category}</Td>
                    ))}
                  </Tr>
                  <Tr>
                    <Td fontWeight="bold">Prix</Td>
                    {compareItems.map((item) => (
                      <Td key={item.id}>{item.price} €/jour</Td>
                    ))}
                  </Tr>
                  <Tr>
                    <Td fontWeight="bold">Disponibilité</Td>
                    {compareItems.map((item) => (
                      <Td key={item.id}>
                        <Badge colorScheme={item.isAvailable ? 'green' : 'red'}>
                          {item.isAvailable ? 'Disponible' : 'Non disponible'}
                        </Badge>
                      </Td>
                    ))}
                  </Tr>
                  <Tr>
                    <Td fontWeight="bold">Localisation</Td>
                    {compareItems.map((item) => (
                      <Td key={item.id}>{item.location || 'N/A'}</Td>
                    ))}
                  </Tr>
                  {compareItems[0]?.specifications && (
                    Object.keys(compareItems[0].specifications).map((key) => (
                      <Tr key={key}>
                        <Td fontWeight="bold" textTransform="capitalize">{key}</Td>
                        {compareItems.map((item) => (
                          <Td key={item.id}>{item.specifications?.[key] || 'N/A'}</Td>
                        ))}
                      </Tr>
                    ))
                  )}
                </Tbody>
              </Table>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onCompareClose}>
              Fermer
            </Button>
            <Button colorScheme="red" onClick={clearCompare}>
              Effacer tout
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal de notifications */}
      <Modal isOpen={isNotificationOpen} onClose={onNotificationClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Préférences de notification</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="stretch" spacing={4}>
              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="email-notifications" mb="0">
                  Notifications par email
                </FormLabel>
                <Switch 
                  id="email-notifications" 
                  isChecked={notificationPreferences.email}
                  onChange={() => handleNotificationToggle('email')}
                  colorScheme="blue"
                />
              </FormControl>
              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="push-notifications" mb="0">
                  Notifications push
                </FormLabel>
                <Switch 
                  id="push-notifications" 
                  isChecked={notificationPreferences.push}
                  onChange={() => handleNotificationToggle('push')}
                  colorScheme="blue"
                />
              </FormControl>
              <FormHelperText>
                Vous serez notifié lorsqu'un équipement que vous avez marqué comme favori devient disponible.
              </FormHelperText>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onNotificationClose}>
              Annuler
            </Button>
            <Button colorScheme="blue" onClick={handleNotificationSave}>
              Enregistrer
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal d'exportation */}
      <Modal isOpen={isExportOpen} onClose={onExportClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Exporter les résultats</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="stretch" spacing={4}>
              <Text>Choisissez le format d'exportation :</Text>
              <RadioGroup defaultValue="pdf">
                <Stack direction="row" spacing={5}>
                  <Radio value="pdf">PDF</Radio>
                  <Radio value="excel">Excel</Radio>
                </Stack>
              </RadioGroup>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onExportClose}>
              Annuler
            </Button>
            <Button colorScheme="blue" onClick={() => handleExport('pdf')}>
              Exporter en PDF
            </Button>
            <Button colorScheme="green" ml={3} onClick={() => handleExport('excel')}>
              Exporter en Excel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Drawer d'historique */}
      <Drawer
        isOpen={isHistoryOpen}
        placement="right"
        onClose={onHistoryClose}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Historique de recherche</DrawerHeader>
          <DrawerBody>
            {recentSearches.length === 0 ? (
              <Text>Aucune recherche récente</Text>
            ) : (
              <VStack align="stretch" spacing={2}>
                {recentSearches.map((search, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    justifyContent="flex-start"
                    leftIcon={<SearchIcon />}
                    onClick={() => {
                      setFilters(prev => ({ ...prev, search }));
                      onHistoryClose();
                    }}
                  >
                    {search}
                  </Button>
                ))}
              </VStack>
            )}
          </DrawerBody>
          <DrawerFooter>
            <Button variant="outline" mr={3} onClick={onHistoryClose}>
              Fermer
            </Button>
            <Button colorScheme="red" onClick={() => setRecentSearches([])}>
              Effacer l'historique
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Modal de notation */}
      <Modal isOpen={isRatingModalOpen} onClose={onRatingClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Donner votre avis</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Text>Note :</Text>
              <HStack spacing={2}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <IconButton
                    key={star}
                    aria-label={`${star} étoiles`}
                    icon={<StarIcon boxSize={5} color={star <= userRating ? 'yellow.400' : 'gray.300'} />}
                    onClick={() => setUserRating(star)}
                  />
                ))}
              </HStack>
              <Textarea
                value={userComment}
                onChange={(e) => setUserComment(e.target.value)}
                placeholder="Commentaire"
              />
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onRatingClose}>
              Annuler
            </Button>
            <Button colorScheme="blue" onClick={() => handleRating(selectedEquipment?.id || '')}>
              Enregistrer
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default EquipmentList;