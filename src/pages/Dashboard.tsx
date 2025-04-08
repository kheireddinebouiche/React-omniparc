import React, { useState } from 'react';
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
} from 'react-icons/fa';
import { RootState } from '../store';
import { User, UserRole, Equipment } from '../types/index';
import { addEquipment, updateEquipment, setEquipment } from '../store/slices/equipmentSlice';
import * as equipmentService from '../services/equipmentService';
import { useNotification } from '../contexts/NotificationContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

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
  });
  const [specificationFields, setSpecificationFields] = useState<string[]>(['poids', 'puissance', 'capacité']);
  const [sortBy, setSortBy] = useState('name');
  const [filterCategory, setFilterCategory] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

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

  // Champs de spécifications disponibles
  const availableSpecFields = [
    { key: 'poids', label: 'Poids' },
    { key: 'hauteur', label: 'Hauteur' },
    { key: 'largeur', label: 'Largeur' },
    { key: 'longueur', label: 'Longueur' },
    { key: 'puissance', label: 'Puissance' },
    { key: 'capacité', label: 'Capacité' },
    { key: 'année', label: 'Année' },
    { key: 'marque', label: 'Marque' },
    { key: 'modèle', label: 'Modèle' },
    { key: 'carburant', label: 'Carburant' },
    { key: 'heures', label: 'Heures d\'utilisation' },
  ];

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
    <Container maxWidth="xl" sx={{ pt: 4, px: { xs: 2, sm: 3, md: 4 } }}>
      <Box sx={{ mb: 4 }}>
        <Heading as="h1" size="xl" fontWeight="bold" color="primary.main">
          Tableau de bord
        </Heading>
        <Text color="text.secondary">
          Gérez vos engins et suivez vos statistiques
        </Text>
      </Box>

      {/* Statistiques */}
      <Grid templateColumns="repeat(4, 1fr)" gap={4} mb={4}>
        <GridItem colSpan={{ base: 12, sm: 6, md: 3 }}>
          <Card
            p={3}
            display="flex"
            flexDirection="column"
            alignItems="center"
            bg="primary.100"
            color="primary.700"
            borderRadius="lg"
            transition="all 0.3s"
            _hover={cardHoverStyle}
          >
            <Box mb={2}>
              <FaBox size={40} />
            </Box>
            <Text fontSize="2xl" fontWeight="bold">{stats.totalEquipment}</Text>
            <Text fontSize="sm">Total des engins</Text>
          </Card>
        </GridItem>
        <GridItem colSpan={{ base: 12, sm: 6, md: 3 }}>
          <Card
            p={3}
            display="flex"
            flexDirection="column"
            alignItems="center"
            bg="green.100"
            color="green.700"
            borderRadius="lg"
            transition="all 0.3s"
            _hover={cardHoverStyle}
          >
            <Box mb={2}>
              <FaCheckCircle size={40} />
            </Box>
            <Text fontSize="2xl" fontWeight="bold">{stats.availableEquipment}</Text>
            <Text fontSize="sm">Engins disponibles</Text>
          </Card>
        </GridItem>
        <GridItem colSpan={{ base: 12, sm: 6, md: 3 }}>
          <Card
            p={3}
            display="flex"
            flexDirection="column"
            alignItems="center"
            bg="blue.100"
            color="blue.700"
            borderRadius="lg"
            transition="all 0.3s"
            _hover={cardHoverStyle}
          >
            <Box mb={2}>
              <FaEuroSign size={40} />
            </Box>
            <Text fontSize="2xl" fontWeight="bold">{stats.totalValue.toLocaleString()}€</Text>
            <Text fontSize="sm">Valeur totale</Text>
          </Card>
        </GridItem>
        <GridItem colSpan={{ base: 12, sm: 6, md: 3 }}>
          <Card
            p={3}
            display="flex"
            flexDirection="column"
            alignItems="center"
            bg="orange.100"
            color="orange.700"
            borderRadius="lg"
            transition="all 0.3s"
            _hover={cardHoverStyle}
          >
            <Box mb={2}>
              <FaChartLine size={40} />
            </Box>
            <Text fontSize="2xl" fontWeight="bold">{stats.averagePrice.toLocaleString()}€</Text>
            <Text fontSize="sm">Prix moyen/jour</Text>
          </Card>
        </GridItem>
      </Grid>

      {/* Filtres et tri */}
      <Card p={4} mb={4} borderRadius="lg">
        <Stack direction={{ base: "column", md: "row" }} spacing={4} align="center">
          <FormControl maxW="200px">
            <FormLabel>Catégorie</FormLabel>
            <Select value={filterCategory} onChange={handleFilterCategoryChange}>
              <option value="">Toutes</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </Select>
          </FormControl>
          <FormControl maxW="200px">
            <FormLabel>Trier par</FormLabel>
            <Select value={sortBy} onChange={handleSortByChange}>
              <option value="name">Nom</option>
              <option value="price">Prix</option>
              <option value="category">Catégorie</option>
            </Select>
          </FormControl>
          <Button
            leftIcon={<FaPlus />}
            onClick={handleAddEquipment}
            colorScheme="blue"
            ml={{ base: 0, md: "auto" }}
          >
            Ajouter un engin
          </Button>
        </Stack>
      </Card>

      {/* Liste des engins */}
      <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }} gap={4}>
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
          .map((item) => (
            <Card
              key={item.id}
              maxW="sm"
              overflow="hidden"
              transition="all 0.3s"
              _hover={cardHoverStyle}
            >
              <Box position="relative" height="150px">
                <Image
                  src={item.image || 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'}
                  alt={item.name}
                  objectFit="cover"
                  w="100%"
                  h="100%"
                />
                <Box
                  position="absolute"
                  top={4}
                  right={4}
                  zIndex={1}
                  display="flex"
                  alignItems="center"
                  gap={2}
                  backdropFilter="blur(8px)"
                  bg="whiteAlpha.800"
                  borderRadius="xl"
                  px={3}
                  py={2}
                >
                  <Box
                    w={2}
                    h={2}
                    borderRadius="full"
                    bg={item.isAvailable ? "green.500" : "red.500"}
                    boxShadow={`0 0 8px ${item.isAvailable ? "green.500" : "red.500"}`}
                  />
                  <Text
                    fontSize="xs"
                    fontWeight="semibold"
                    color={item.isAvailable ? "green.700" : "red.700"}
                    textTransform="uppercase"
                    letterSpacing="wider"
                  >
                    {item.isAvailable ? 'Disponible' : 'Non disponible'}
                  </Text>
                </Box>
              </Box>
              <CardBody>
                <Stack spacing={3}>
                  <Heading size="md">{item.name}</Heading>
                  <Text color="gray.600" noOfLines={2}>
                    {item.description}
                  </Text>
                  <Stack direction="row" spacing={2}>
                    <HStack spacing={1}>
                      <FaList />
                      <Tag>
                        {categories.find(c => c.value === item.category)?.label || item.category}
                      </Tag>
                    </HStack>
                    <HStack spacing={1}>
                      <FaEuroSign />
                      <Tag>
                        {`${item.price}€/jour`}
                      </Tag>
                    </HStack>
                  </Stack>
                  <Stack direction="row" flexWrap="wrap" gap={2}>
                    {Object.entries(item.specifications).slice(0, 3).map(([key, value]) => (
                      <Tag key={key} variant="outline">
                        {`${key}: ${value}`}
                      </Tag>
                    ))}
                  </Stack>
                </Stack>
              </CardBody>
              <CardFooter
                justify="space-between"
                flexWrap="wrap"
                gap={2}
                borderTop="1px"
                borderColor="gray.200"
                p={4}
              >
                <Button
                  leftIcon={<FaEdit />}
                  onClick={() => handleEditEquipment(item)}
                  colorScheme="blue"
                  variant="ghost"
                >
                  Modifier
                </Button>
                <Button
                  leftIcon={<FaTrash />}
                  onClick={() => handleDeleteEquipment(item.id)}
                  colorScheme="red"
                  variant="ghost"
                >
                  Supprimer
                </Button>
              </CardFooter>
            </Card>
          ))}
      </Grid>

      {/* Modal pour ajouter/modifier un engin */}
      <Modal isOpen={isOpen} onClose={handleCloseDialog} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedEquipment ? 'Modifier l\'engin' : 'Ajouter un engin'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {localError && (
              <Alert status="error" mb={4}>
                <AlertIcon />
                {localError}
              </Alert>
            )}
            <Stack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Nom de l'engin</FormLabel>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Description</FormLabel>
                <Input
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  as="textarea"
                  minH="100px"
                />
              </FormControl>
              <Stack direction={{ base: "column", sm: "row" }} spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Prix par jour (€)</FormLabel>
                  <Input
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleInputChange}
                    min={0}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Catégorie</FormLabel>
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    <option value="" disabled>Sélectionnez une catégorie</option>
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
              <FormControl>
                <FormLabel>URL de l'image</FormLabel>
                <Input
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                />
              </FormControl>
              <Box>
                <Heading size="sm" mb={2}>Spécifications techniques</Heading>
                <Stack direction="row" wrap="wrap" spacing={2} mb={4}>
                  {availableSpecFields.map((field) => (
                    <Tag
                      key={field.key}
                      cursor="pointer"
                      onClick={() => handleAddSpecField(field.key)}
                      colorScheme={specificationFields.includes(field.key) ? "blue" : "gray"}
                      variant={specificationFields.includes(field.key) ? "solid" : "outline"}
                    >
                      {field.label}
                    </Tag>
                  ))}
                </Stack>
                <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)" }} gap={4}>
                  {specificationFields.map((fieldKey) => {
                    const field = availableSpecFields.find(f => f.key === fieldKey);
                    return (
                      <FormControl key={fieldKey}>
                        <FormLabel>{field?.label || fieldKey}</FormLabel>
                        <InputGroup>
                          <Input
                            name={`spec_${fieldKey}`}
                            value={formData.specifications[fieldKey] || ''}
                            onChange={handleInputChange}
                          />
                          <InputRightElement>
                            <IconButton
                              aria-label="Supprimer"
                              icon={<FaTrash />}
                              size="sm"
                              onClick={() => handleRemoveSpecField(fieldKey)}
                              variant="ghost"
                            />
                          </InputRightElement>
                        </InputGroup>
                      </FormControl>
                    );
                  })}
                </Grid>
              </Box>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleCloseDialog}>
              Annuler
            </Button>
            <Button colorScheme="blue" onClick={handleSubmit}>
              {selectedEquipment ? 'Modifier' : 'Ajouter'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default Dashboard; 