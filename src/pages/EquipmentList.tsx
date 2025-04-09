import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Grid,
  Container,
  Heading,
  Text,
  Button,
  Input,
  FormControl,
  FormLabel,
  Select,
  IconButton,
  useColorModeValue,
  VStack,
  HStack,
  Divider,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Badge,
  useBreakpointValue,
  Spinner,
  Alert,
  AlertIcon,
  Icon,
} from '@chakra-ui/react';
import { SearchIcon, CloseIcon } from '@chakra-ui/icons';
import { FaFilter, FaTag, FaEuroSign, FaExclamationTriangle, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { RootState } from '../store';
import { EquipmentState, setEquipment } from '../store/slices/equipmentSlice';
import { getEquipments } from '../services/equipmentService';
import EquipmentCard from '../components/EquipmentCard';

const EquipmentList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: equipment, loading, error } = useSelector((state: RootState) => (state.equipment as EquipmentState));
  const { user } = useSelector((state: RootState) => state.auth);
  const isMobile = useBreakpointValue({ base: true, md: false });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  const [filters, setFilters] = useState({
    search: '',
    category: '',
    priceRange: '',
  });

  const [page, setPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const equipmentData = await getEquipments();
        dispatch(setEquipment(equipmentData));
      } catch (err) {
        console.error('Erreur lors du chargement des équipements:', err);
      }
    };

    fetchEquipment();
  }, [dispatch]);

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

  const filteredEquipment = equipment.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(filters.search.toLowerCase());
    const matchesCategory = !filters.category || item.category === filters.category;
    const matchesPrice = !filters.priceRange || item.price <= parseInt(filters.priceRange);
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const paginatedEquipment = filteredEquipment.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handlePageChange = (value: number) => {
    setPage(value);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    if (isMobile) {
      onOpen();
    }
  };

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box minH="100vh"  bg={useColorModeValue('gray.50', 'gray.900')} display="flex" flexDirection="column">
      <Box 
        bg={useColorModeValue('white', 'gray.800')} 
        py={2} 
        px={4} 
        borderBottom="1px" 
        marginBottom={10}
        borderColor={useColorModeValue('gray.200', 'gray.700')}
        position="relative"
        overflow="hidden"
        mt={0}
      >
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          height="400px"
          bgGradient="linear(to-r, blue.50, purple.50)"
          opacity={useColorModeValue(0.3, 0.1)}
          zIndex={0}
        />
        <Box
          position="absolute"
          top="-50%"
          right="-10%"
          width="300px"
          height="400px"
          borderRadius="full"
          bgGradient="radial(circle, blue.200, transparent 70%)"
          opacity={useColorModeValue(0.2, 0.05)}
          zIndex={0}
        />
        <Container padding={4} maxW="container.xl" position="relative" zIndex={1}>
          <VStack spacing={1} align="center" textAlign="center">
            <Heading
              as="h1"
              size="xl"
              bgGradient="linear(to-r, blue.400, purple.500)"
              bgClip="text"
              fontWeight="extrabold"
              letterSpacing="tight"
              position="relative"
              mt={0}
              _after={{
                content: '""',
                position: 'absolute',
                bottom: '-4px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '60px',
                height: '3px',
                bgGradient: 'linear(to-r, blue.400, purple.500)',
                borderRadius: 'full',
              }}
            >
              Équipements disponibles
            </Heading>
            <Text
              fontSize="lg"
              color={useColorModeValue('gray.600', 'gray.400')}
              maxW="xl"
              lineHeight="tall"
              mt={0}
            >
              Découvrez notre sélection d'équipements de qualité pour tous vos projets
            </Text>
          </VStack>
        </Container>
      </Box>

      <Container maxW="container.xl" py={0} mt={0} flex="1" display="flex" flexDirection="column">
        <Grid templateColumns={{ base: '1fr', lg: '300px 1fr' }} gap={4} flex="1">
          {/* Sidebar des filtres */}
          <Box
            position="sticky"
            top={0}
            p={4}
            bg={useColorModeValue('white', 'gray.800')}
            borderRadius="xl"
            boxShadow="lg"
            height="fit-content"
            borderWidth="1px"
            borderColor={useColorModeValue('gray.200', 'gray.700')}
            mt={2}
            transition="all 0.3s ease"
            _hover={{
              boxShadow: "xl",
              transform: "translateY(-2px)",
            }}
          >
            <VStack spacing={4} align="stretch">
              <HStack>
                <FaFilter color="blue.500" />
                <Text fontWeight="bold" fontSize="lg">Filtres</Text>
              </HStack>
              <Divider />
              <FormControl>
                <FormLabel fontWeight="medium">Rechercher</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <SearchIcon color="blue.400" />
                  </InputLeftElement>
                  <Input
                    name="search"
                    value={filters.search}
                    onChange={handleTextChange}
                    placeholder="Rechercher un équipement..."
                    borderRadius="md"
                    borderColor="gray.300"
                    _hover={{ borderColor: 'blue.400' }}
                    _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500' }}
                  />
                </InputGroup>
              </FormControl>
              <FormControl>
                <FormLabel fontWeight="medium">Catégorie</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <FaTag color="blue.400" />
                  </InputLeftElement>
                  <Select
                    name="category"
                    value={filters.category}
                    onChange={handleSelectChange}
                    borderRadius="md"
                    borderColor="gray.300"
                    _hover={{ borderColor: 'blue.400' }}
                    _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500' }}
                  >
                    <option value="">Toutes</option>
                    <option value="excavation">Excavation</option>
                    <option value="transport">Transport</option>
                    <option value="construction">Construction</option>
                  </Select>
                </InputGroup>
              </FormControl>
              <FormControl>
                <FormLabel fontWeight="medium">Prix maximum</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <FaEuroSign color="blue.400" />
                  </InputLeftElement>
                  <Select
                    name="priceRange"
                    value={filters.priceRange}
                    onChange={handleSelectChange}
                    borderRadius="md"
                    borderColor="gray.300"
                    _hover={{ borderColor: 'blue.400' }}
                    _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500' }}
                  >
                    <option value="">Tous les prix</option>
                    <option value="500">500€/jour</option>
                    <option value="1000">1000€/jour</option>
                    <option value="2000">2000€/jour</option>
                  </Select>
                </InputGroup>
              </FormControl>
              <Button 
                colorScheme="blue" 
                size="md" 
                width="100%" 
                onClick={() => setFilters({ search: '', category: '', priceRange: '' })}
                variant="outline"
                leftIcon={<FaFilter />}
                _hover={{
                  transform: "translateY(-1px)",
                  boxShadow: "md",
                }}
              >
                Réinitialiser les filtres
              </Button>
            </VStack>
          </Box>

          {/* Contenu principal */}
          <Box display="flex" flexDirection="column" justifyContent="flex-start" mt={2}>
            {loading ? (
              <Box textAlign="center" py={10} bg={bgColor} borderRadius="xl" boxShadow="md" p={6}>
                <Spinner size="xl" color="blue.500" thickness="4px" speed="0.65s" />
                <Text mt={2} color="gray.500">Chargement des équipements...</Text>
              </Box>
            ) : error ? (
              <Alert status="error" borderRadius="md" mb={2}>
                <AlertIcon />
                <Text>Erreur lors du chargement des équipements: {error}</Text>
              </Alert>
            ) : paginatedEquipment.length === 0 ? (
              <Box textAlign="center" py={10} bg={bgColor} borderRadius="xl" boxShadow="md" p={6}>
                <FaExclamationTriangle size={40} color="gray.400" />
                <Heading size="md" mt={2} color="gray.500">Aucun équipement trouvé</Heading>
                <Text mt={2} color="gray.400">Essayez de modifier vos filtres de recherche</Text>
                <Button mt={4} colorScheme="blue" onClick={() => setFilters({ search: '', category: '', priceRange: '' })}>
                  Réinitialiser les filtres
                </Button>
              </Box>
            ) : (
              <>
                <Box 
                  mb={4} 
                  display="flex" 
                  justifyContent="space-between" 
                  alignItems="center"
                  bg={useColorModeValue('white', 'gray.800')}
                  p={3}
                  borderRadius="lg"
                  boxShadow="sm"
                  borderWidth="1px"
                  borderColor={useColorModeValue('gray.200', 'gray.700')}
                >
                  <Text color="gray.500" fontWeight="medium">
                    {filteredEquipment.length} équipement{filteredEquipment.length !== 1 ? 's' : ''} trouvé{filteredEquipment.length !== equipment.length ? 's' : ''}
                  </Text>
                  <HStack spacing={2}>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                      isDisabled={page === 1}
                      leftIcon={<Icon as={FaChevronLeft} />}
                      _hover={{
                        transform: "translateX(-1px)",
                      }}
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
                      _hover={{
                        transform: "translateX(1px)",
                      }}
                    >
                      Suivant
                    </Button>
                  </HStack>
                </Box>
                <Grid
                  templateColumns={{
                    base: '1fr',
                    md: 'repeat(2, 1fr)',
                    lg: 'repeat(3, 1fr)',
                  }}
                  gap={6}
                >
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
                      />
                    </Box>
                  ))}
                </Grid>
              </>
            )}
          </Box>
        </Grid>
      </Container>
    </Box>
  );
};

export default EquipmentList;