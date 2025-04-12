import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  useToast,
  Grid,
  GridItem,
  Card,
  CardBody,
  Divider,
  HStack,
  Badge,
  useColorModeValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Alert,
  AlertIcon,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { FaSave, FaArrowLeft, FaCalendarAlt } from 'react-icons/fa';
import { Equipment } from '../types';
import * as equipmentService from '../services/equipmentService';
import { useNotification } from '../contexts/NotificationContext';
import * as availabilityService from '../services/availabilityService';
import { Availability } from '../services/availabilityService';

const localizer = momentLocalizer(moment);

interface AvailabilityEvent {
  startDate: Date;
  endDate: Date;
  status: 'available' | 'unavailable';
  equipmentId?: string;
}

const EquipmentEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { showNotification } = useNotification();
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [availabilityData, setAvailabilityData] = useState<Availability[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    specifications: {} as Record<string, string>,
    location: '',
  });

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    const loadEquipment = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await equipmentService.getEquipment(id);
        
        if (!data) {
          setError('Engin non trouvé');
          return;
        }
        
        setEquipment(data);
        setFormData({
          name: data.name,
          description: data.description,
          price: data.price.toString(),
          category: data.category,
          image: data.image || '',
          specifications: data.specifications || {},
          location: data.location || '',
        });
        
        // Charger les disponibilités réelles
        const availabilities = await availabilityService.getEquipmentAvailability(id);
        setAvailabilityData(availabilities);
      } catch (err) {
        setError('Erreur lors du chargement des données');
        showNotification('Impossible de charger les données de l\'engin', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadEquipment();
  }, [id, showNotification]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSpecificationChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [key]: value,
      },
    }));
  };

  const handleAvailabilitySelect = ({ start, end }: { start: Date; end: Date }) => {
    if (!id) return;
    
    // Vérifier que les dates sont valides
    if (!start || !end || start >= end) {
      showNotification('Période invalide sélectionnée', 'error');
      return;
    }
    
    const newAvailability: Availability = {
      equipmentId: id,
      startDate: new Date(start),
      endDate: new Date(end),
      status: 'available'
    };
    
    console.log('Nouvelle disponibilité ajoutée:', newAvailability);
    setAvailabilityData(prev => [...prev, newAvailability]);
  };

  const handleSave = async () => {
    if (!id || !user) return;

    try {
      setSaving(true);
      
      // Vérifier si l'utilisateur est le propriétaire de l'équipement
      if (equipment?.ownerId !== user.id && user.role !== 'ADMIN') {
        setError('Vous n\'avez pas les permissions nécessaires pour modifier cet engin');
        return;
      }

      const updatedEquipment = {
        ...equipment,
        ...formData,
        price: parseFloat(formData.price),
      };

      await equipmentService.updateEquipment(id, updatedEquipment);
      
      // Filtrer les disponibilités invalides
      const validAvailabilities = availabilityData.filter(av => 
        av.startDate && av.endDate && av.startDate < av.endDate
      );
      
      await availabilityService.updateEquipmentAvailability(id, validAvailabilities);

      showNotification('Engin mis à jour avec succès', 'success');
      navigate('/dashboard');
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
      setError('Erreur lors de la sauvegarde');
      showNotification('Impossible de sauvegarder les modifications', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="blue.500" thickness="4px" />
      </Center>
    );
  }

  if (!equipment) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error">
          <AlertIcon />
          Engin non trouvé
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <HStack justify="space-between">
          <Button
            leftIcon={<FaArrowLeft />}
            variant="ghost"
            onClick={() => navigate('/dashboard')}
          >
            Retour
          </Button>
          <Button
            leftIcon={<FaSave />}
            colorScheme="blue"
            isLoading={saving}
            onClick={handleSave}
          >
            Enregistrer les modifications
          </Button>
        </HStack>

        {error && (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        )}

        <Tabs variant="enclosed" colorScheme="blue">
          <TabList>
            <Tab>Détails</Tab>
            <Tab>Disponibilité</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
                <GridItem>
                  <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                    <CardBody>
                      <VStack spacing={4} align="stretch">
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
                          <Textarea
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
                            type="number"
                            placeholder="Ex: 150"
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
                            <option value="excavation">Excavation</option>
                            <option value="transport">Transport</option>
                            <option value="construction">Construction</option>
                            <option value="manutention">Manutention</option>
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
                      </VStack>
                    </CardBody>
                  </Card>
                </GridItem>

                <GridItem>
                  <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        <Heading size="md">Spécifications techniques</Heading>
                        <Divider />
                        {Object.entries(equipment.specifications || {}).map(([key, value]) => (
                          <FormControl key={key}>
                            <FormLabel>{key}</FormLabel>
                            <Input
                              value={formData.specifications[key] || ''}
                              onChange={(e) => handleSpecificationChange(key, e.target.value)}
                              placeholder={`Valeur pour ${key}`}
                            />
                          </FormControl>
                        ))}
                      </VStack>
                    </CardBody>
                  </Card>
                </GridItem>
              </Grid>
            </TabPanel>

            <TabPanel>
              <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <HStack justify="space-between">
                      <Heading size="md">Calendrier de disponibilité</Heading>
                      <Badge colorScheme="blue" fontSize="md">
                        {availabilityData.length} périodes définies
                      </Badge>
                    </HStack>
                    <Divider />
                    <Box h="600px">
                      <Calendar
                        localizer={localizer}
                        events={availabilityData}
                        startAccessor="startDate"
                        endAccessor="endDate"
                        titleAccessor={(event) => event.status === 'available' ? 'Disponible' : 'Indisponible'}
                        style={{ height: '100%' }}
                        selectable
                        onSelectSlot={handleAvailabilitySelect}
                        views={['month', 'week', 'day']}
                        defaultView={Views.MONTH}
                      />
                    </Box>
                  </VStack>
                </CardBody>
              </Card>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Container>
  );
};

export default EquipmentEdit; 