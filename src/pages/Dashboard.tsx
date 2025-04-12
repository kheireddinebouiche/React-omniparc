import React, { FC, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  CardHeader,
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
  TableContainer,
  Icon,
  FormErrorMessage,
  Textarea,
  AlertTitle,
  AlertDescription,
  ButtonGroup,
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
  FaUser,
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
  FaCheck,
  FaTimes,
  FaInfoCircle,
  FaBan,
  FaUserShield,
  FaBuilding,
  FaTools,
  FaEnvelope,
  FaFileAlt,
  FaChevronLeft,
  FaChevronRight,
  FaEye,
  FaPrint,
  FaUpload,
  FaStar,
  FaFileUpload,
  FaExchangeAlt,
} from 'react-icons/fa';
import { RootState } from '../store';
import { User, UserRole, Equipment, RentalRequest, VerificationDocument, VerificationHistory } from '../types';
import { VerificationStatus } from '../types/enums';
import { addEquipment, updateEquipment, setEquipment } from '../store/slices/equipmentSlice';
import * as equipmentService from '../services/equipmentService';
import { useNotification } from '../contexts/NotificationContext';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { getRentalRequestsByUser, getRentalRequestsByEquipment, cancelRentalRequest, deleteRentalRequest, approveRentalRequest, updateRentalRequest } from '../services/rentalService';
import * as userService from '../services/userService';
import { verificationService } from '../services/verificationService';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { VerificationDocuments } from '../components/VerificationDocuments';
import { getEquipmentsByOwner } from '../services/equipmentService';

const DOCUMENT_TYPES = {
  ID: 'Pièce d\'identité',
  BUSINESS_LICENSE: 'Licence professionnelle',
  INSURANCE: 'Assurance',
  PROFESSIONAL_CERTIFICATION: 'Certification professionnelle'
} as const;

interface AvailabilityEvent {
  start: Date;
  end: Date;
  title: string;
}

interface AvailabilityData {
  [key: string]: AvailabilityEvent[];
}

const Dashboard: FC = (): JSX.Element => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();
  const { user } = useSelector((state: RootState) => state.auth) as { user: User | null };
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<User>>({});
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
  const [rentalRequests, setRentalRequests] = useState<RentalRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<RentalRequest | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'COMPLETED'>();
  const [loading, setLoading] = useState(true);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleRentalRequestUpdate = async (
    requestId: string, 
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'COMPLETED'
  ) => {
    try {
      await updateRentalRequest(requestId, { status });
      toast({
        title: "Demande mise à jour",
        description: `La demande a été ${status === 'APPROVED' ? 'approuvée' : 'rejetée'} avec succès.`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      // Rafraîchir la liste des demandes
      const updatedRequests = await getRentalRequestsByUser(user?.id || '');
      setRentalRequests(updatedRequests);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la demande.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleAddEquipment = (equipment: Equipment) => {
    // ... existing code ...
  };

  const handleUpdateEquipment = (equipment: Equipment) => {
    // ... existing code ...
  };

  const handleCreateEquipment = (equipmentData: Omit<Equipment, 'id'>) => {
    // ... existing code ...
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        if (user) {
          const [equipmentData, requestsData] = await Promise.all([
            getEquipmentsByOwner(user.id),
            getRentalRequestsByUser(user.id)
          ]);
          setEquipment(equipmentData);
          setRentalRequests(requestsData);
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
  }, [user, toast]);

  useEffect(() => {
    if (user) {
      if (user.role === 'ADMIN') {
        navigate('/admin-dashboard');
      } else if (user.role === 'PROFESSIONAL' || user.role === 'BUSINESS') {
        navigate('/professional-dashboard');
      } else {
        // Pour les clients, on peut garder une version simplifiée du dashboard
        // ou rediriger vers une autre page
        navigate('/client-dashboard');
      }
    }
  }, [user, navigate]);

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

  return (
    <Container maxW="container.xl" p={4}>
      {user?.role === 'ADMIN' ? (
        <Box>
          <Heading mb={6}>Tableau de bord administrateur</Heading>
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
      ) : (
        <Box>
          <Heading mb={6}>Tableau de bord {user?.role === 'PROFESSIONAL' ? 'professionnel' : user?.role === 'BUSINESS' ? 'entreprise' : 'client'}</Heading>
          
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

          <Tabs>
            <TabList>
              <Tab>Mes équipements</Tab>
              <Tab>Mes locations</Tab>
              {user?.role === 'PROFESSIONAL' || user?.role === 'BUSINESS' ? (
                <Tab>Documents de vérification</Tab>
              ) : null}
            </TabList>
            <TabPanels>
              <TabPanel>
                <Box>
                  <Button mb={4} onClick={() => navigate('/my-equipment')}>
                    Voir tous mes équipements
                  </Button>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Nom</Th>
                        <Th>Catégorie</Th>
                        <Th>Prix/jour</Th>
                        <Th>Statut</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {equipment.slice(0, 5).map((eq) => (
                        <Tr key={eq.id}>
                          <Td>{eq.name}</Td>
                          <Td>{eq.category}</Td>
                          <Td>{eq.price}€</Td>
                          <Td>
                            <Badge colorScheme={eq.isAvailable ? 'green' : 'red'}>
                              {eq.isAvailable ? 'Disponible' : 'Indisponible'}
                            </Badge>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              </TabPanel>
              <TabPanel>
                <Box>
                  <Button mb={4} onClick={() => navigate('/rentals')}>
                    Voir toutes mes locations
                  </Button>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Équipement</Th>
                        <Th>Date début</Th>
                        <Th>Date fin</Th>
                        <Th>Statut</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {rentalRequests.slice(0, 5).map((request) => (
                        <Tr key={request.id}>
                          <Td>{request.equipmentName}</Td>
                          <Td>{new Date(request.startDate).toLocaleDateString()}</Td>
                          <Td>{new Date(request.endDate).toLocaleDateString()}</Td>
                          <Td>
                            <Badge colorScheme={getStatusColor(request.status)}>
                              {request.status}
                            </Badge>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              </TabPanel>
              {(user?.role === 'PROFESSIONAL' || user?.role === 'BUSINESS') && (
                <TabPanel>
                  <VerificationDocuments userId={user.id} />
                </TabPanel>
              )}
            </TabPanels>
          </Tabs>
        </Box>
      )}
    </Container>
  );
};

export default Dashboard; 