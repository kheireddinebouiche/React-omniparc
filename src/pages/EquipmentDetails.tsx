import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Container,
  Box,
  Grid,
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
} from 'react-icons/fa';
import { RootState } from '../store';
import { Equipment } from '../types';
import { createRentalRequest } from '../services/rentalService';
import { useNotification } from '../contexts/NotificationContext';

const EquipmentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const isMobile = useBreakpointValue({ base: true, md: false });
  
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
  const [reviews] = useState([
    { id: 1, user: 'Jean Dupont', rating: 5, comment: 'Excellent équipement, très performant.', date: '2023-05-15' },
    { id: 2, user: 'Marie Martin', rating: 4, comment: 'Bon état général, quelques rayures mais rien de grave.', date: '2023-04-22' },
    { id: 3, user: 'Pierre Durand', rating: 3, comment: 'Fonctionne bien mais un peu bruyant.', date: '2023-03-10' },
  ]);

  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.400');

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
      
      const userId = useSelector((state: RootState) => state.auth.user?.id);
      
      await createRentalRequest({
        equipmentId: id!,
        userId: userId!,
        startDate,
        endDate,
        message: message || undefined,
        status: 'PENDING'
      });
      
      showNotification('success', 'Demande de location envoyée avec succès');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de l\'envoi de la demande');
    } finally {
      setLoading(false);
    }
  };

  if (!equipment) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minH="50vh">
          <Spinner />
        </Box>
      </Container>
    );
  }

  // Calculer la note moyenne
  const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;

  return (
    <Container maxW="lg" py={8}>
      <Card bg={cardBg} borderRadius="lg" boxShadow="md" overflow="hidden">
        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
          {/* Image principale */}
          <Box position="relative" minH="400px">
            <Image
              src={equipment.image || 'https://via.placeholder.com/600x400?text=Engin+de+chantier'}
              alt={equipment.name}
              objectFit="cover"
              w="100%"
              h="100%"
            />
            <HStack
              position="absolute"
              top={4}
              right={4}
              spacing={2}
              bg="whiteAlpha.800"
              p={2}
              borderRadius="md"
            >
              <Tooltip label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}>
                <IconButton
                  aria-label="Favoris"
                  icon={isFavorite ? <FaHeart color="red" /> : <FaRegHeart />}
                  onClick={handleFavoriteToggle}
                  variant="ghost"
                />
              </Tooltip>
              <Tooltip label="Partager">
                <IconButton
                  aria-label="Partager"
                  icon={<FaShare />}
                  onClick={handleShare}
                  variant="ghost"
                />
              </Tooltip>
            </HStack>
          </Box>

          {/* Informations principales */}
          <VStack align="stretch" spacing={4} p={6}>
            <Heading as="h1" size="xl">
              {equipment.name}
            </Heading>
            
            <HStack spacing={4}>
              <Badge colorScheme="green" p={2} borderRadius="md">
                <HStack spacing={1}>
                  <FaEuroSign />
                  <Text>{equipment.price}€/jour</Text>
                </HStack>
              </Badge>
              <Badge colorScheme="blue" p={2} borderRadius="md">
                <HStack spacing={1}>
                  <FaTag />
                  <Text>{equipment.category}</Text>
                </HStack>
              </Badge>
            </HStack>

            <Text color={textColor}>{equipment.description}</Text>

            <Divider />

            <Heading as="h2" size="md">
              Spécifications techniques
            </Heading>
            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
              <HStack>
                <FaTools />
                <Text>Marque: {equipment.specifications?.brand}</Text>
              </HStack>
              <HStack>
                <FaTachometerAlt />
                <Text>Puissance: {equipment.specifications?.power}</Text>
              </HStack>
              <HStack>
                <FaWeightHanging />
                <Text>Poids: {equipment.specifications?.weight}</Text>
              </HStack>
              <HStack>
                <FaRulerVertical />
                <Text>Dimensions: {equipment.specifications?.dimensions}</Text>
              </HStack>
            </Grid>

            <Button
              colorScheme="primary"
              size="lg"
              onClick={onOpen}
              isDisabled={!equipment.isAvailable}
            >
              {equipment.isAvailable ? 'Réserver' : 'Non disponible'}
            </Button>
          </VStack>
        </Grid>

        {/* Onglets */}
        <Box p={6}>
          <Tabs index={tabIndex} onChange={setTabIndex}>
            <TabList>
              <Tab>Détails</Tab>
              <Tab>Avis ({reviews.length})</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <VStack align="stretch" spacing={4}>
                  <Text>{equipment.description}</Text>
                  {/* Ajouter plus de détails ici */}
                </VStack>
              </TabPanel>

              <TabPanel>
                <VStack align="stretch" spacing={4}>
                  <HStack>
                    <FaStar color="gold" />
                    <Text fontWeight="bold">
                      Note moyenne: {averageRating.toFixed(1)}/5
                    </Text>
                  </HStack>
                  <List spacing={4}>
                    {reviews.map((review) => (
                      <ListItem key={review.id}>
                        <Card variant="outline">
                          <CardBody>
                            <HStack spacing={4} mb={2}>
                              <Avatar name={review.user} />
                              <VStack align="start" spacing={0}>
                                <Text fontWeight="bold">{review.user}</Text>
                                <Text fontSize="sm" color={textColor}>
                                  {review.date}
                                </Text>
                              </VStack>
                            </HStack>
                            <HStack spacing={1} mb={2}>
                              {[...Array(5)].map((_, i) => (
                                <FaStar
                                  key={i}
                                  color={i < review.rating ? 'gold' : 'gray'}
                                />
                              ))}
                            </HStack>
                            <Text>{review.comment}</Text>
                          </CardBody>
                        </Card>
                      </ListItem>
                    ))}
                  </List>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Card>

      {/* Modal de réservation */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Demande de location</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Date de début</FormLabel>
                <Input
                  name="startDate"
                  type="date"
                  value={startDate}
                  onChange={handleDateChange}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Date de fin</FormLabel>
                <Input
                  name="endDate"
                  type="date"
                  value={endDate}
                  onChange={handleDateChange}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Message (optionnel)</FormLabel>
                <Textarea
                  value={message}
                  onChange={handleMessageChange}
                  placeholder="Ajoutez un message pour le propriétaire..."
                />
              </FormControl>
              {error && (
                <Alert status="error">
                  <AlertIcon />
                  {error}
                </Alert>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Annuler
            </Button>
            <Button
              colorScheme="primary"
              onClick={handleRentalSubmit}
              isLoading={loading}
              loadingText="Envoi en cours..."
            >
              Envoyer la demande
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default EquipmentDetails; 