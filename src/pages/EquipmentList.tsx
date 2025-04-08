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
} from '@chakra-ui/react';
import { SearchIcon, CloseIcon } from '@chakra-ui/icons';
import { FaFilter, FaTag, FaEuroSign } from 'react-icons/fa';
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
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      <Container maxW="container.xl" py={8}>
        <HStack justify="space-between" mb={6}>
          <Heading as="h1" size="xl">
            Équipements disponibles
          </Heading>
          {isMobile && (
            <Button
              leftIcon={<FaFilter />}
              onClick={toggleSidebar}
              variant="outline"
            >
              Filtres
            </Button>
          )}
        </HStack>

        <Grid templateColumns={{ base: '1fr', lg: sidebarOpen ? '300px 1fr' : '1fr' }} gap={6}>
          {/* Sidebar */}
          <Box
            display={{ base: 'none', lg: 'block' }}
            w={sidebarOpen ? '300px' : '0'}
            transition="all 0.3s"
            overflow="hidden"
          >
            <Box
              position="sticky"
              top={4}
              p={4}
              bg={bgColor}
              borderWidth="1px"
              borderColor={borderColor}
              borderRadius="lg"
              boxShadow="sm"
            >
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <HStack>
                    <FaFilter color="blue.500" />
                    <Text fontWeight="bold">Filtres</Text>
                  </HStack>
                  {isMobile && (
                    <IconButton
                      aria-label="Fermer les filtres"
                      icon={<CloseIcon />}
                      size="sm"
                      onClick={onClose}
                    />
                  )}
                </HStack>
                <Divider />
                <FormControl>
                  <FormLabel>Rechercher</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <SearchIcon color="gray.400" />
                    </InputLeftElement>
                    <Input
                      name="search"
                      value={filters.search}
                      onChange={handleTextChange}
                      placeholder="Rechercher un équipement..."
                    />
                  </InputGroup>
                </FormControl>
                <FormControl>
                  <FormLabel>Catégorie</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <FaTag color="gray.400" />
                    </InputLeftElement>
                    <Select
                      name="category"
                      value={filters.category}
                      onChange={handleSelectChange}
                    >
                      <option value="">Toutes</option>
                      <option value="excavation">Excavation</option>
                      <option value="transport">Transport</option>
                      <option value="construction">Construction</option>
                    </Select>
                  </InputGroup>
                </FormControl>
                <FormControl>
                  <FormLabel>Prix maximum</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <FaEuroSign color="gray.400" />
                    </InputLeftElement>
                    <Select
                      name="priceRange"
                      value={filters.priceRange}
                      onChange={handleSelectChange}
                    >
                      <option value="">Tous les prix</option>
                      <option value="500">500€/jour</option>
                      <option value="1000">1000€/jour</option>
                      <option value="2000">2000€/jour</option>
                    </Select>
                  </InputGroup>
                </FormControl>
              </VStack>
            </Box>
          </Box>

          {/* Main content */}
          <Box>
            <Grid
              templateColumns={{
                base: '1fr',
                md: 'repeat(2, 1fr)',
                lg: 'repeat(3, 1fr)',
              }}
              gap={6}
            >
              {paginatedEquipment.map((item) => (
                <EquipmentCard
                  key={item.id}
                  equipment={item}
                  onView={() => navigate(`/equipment/${item.id}`)}
                  isAdmin={user?.role === 'ADMIN'}
                />
              ))}
            </Grid>
          </Box>
        </Grid>
      </Container>

      {/* Mobile drawer */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>
            <HStack>
              <FaFilter color="blue.500" />
              <Text>Filtres</Text>
            </HStack>
          </DrawerHeader>
          <DrawerBody>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Rechercher</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <SearchIcon color="gray.400" />
                  </InputLeftElement>
                  <Input
                    name="search"
                    value={filters.search}
                    onChange={handleTextChange}
                    placeholder="Rechercher un équipement..."
                  />
                </InputGroup>
              </FormControl>
              <FormControl>
                <FormLabel>Catégorie</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <FaTag color="gray.400" />
                  </InputLeftElement>
                  <Select
                    name="category"
                    value={filters.category}
                    onChange={handleSelectChange}
                  >
                    <option value="">Toutes</option>
                    <option value="excavation">Excavation</option>
                    <option value="transport">Transport</option>
                    <option value="construction">Construction</option>
                  </Select>
                </InputGroup>
              </FormControl>
              <FormControl>
                <FormLabel>Prix maximum</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <FaEuroSign color="gray.400" />
                  </InputLeftElement>
                  <Select
                    name="priceRange"
                    value={filters.priceRange}
                    onChange={handleSelectChange}
                  >
                    <option value="">Tous les prix</option>
                    <option value="500">500€/jour</option>
                    <option value="1000">1000€/jour</option>
                    <option value="2000">2000€/jour</option>
                  </Select>
                </InputGroup>
              </FormControl>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default EquipmentList; 