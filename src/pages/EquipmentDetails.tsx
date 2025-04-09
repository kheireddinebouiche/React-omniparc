import React, { useState, useEffect } from 'react';
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
} from 'react-icons/fa';
import { RootState } from '../store';
import { Equipment } from '../types';
import { createRentalRequest } from '../services/rentalService';
import { useNotification } from '../contexts/NotificationContext';

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
  const [availability, setAvailability] = useState<{ date: string; status: 'available' | 'unavailable' }[]>([]);

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

  // Simuler le chargement des disponibilités
  useEffect(() => {
    // Dans une application réelle, vous récupéreriez ces données depuis une API
    const generateAvailability = () => {
      const today = new Date();
      const dates = [];
      
      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        
        // Simuler des périodes de disponibilité et d'indisponibilité
        const isAvailable = Math.random() > 0.3;
        
        dates.push({
          date: date.toISOString().split('T')[0],
          status: isAvailable ? 'available' : 'unavailable'
        });
      }
      
      return dates;
    };
    
    setAvailability(generateAvailability());
  }, []);

  if (!equipment) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minH="50vh">
          <Spinner size="xl" color={accentColor} thickness="4px" />
        </Box>
      </Container>
    );
  }

  // Calculer la note moyenne
  const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;

  return (
    <Box bg={useColorModeValue('gray.50', 'gray.900')} minH="100vh" py={8}>
      <Container maxW="container.xl">
        {/* Bouton retour */}
        <Button 
          leftIcon={<FaArrowLeft />} 
          variant="ghost" 
          mb={6}
          onClick={() => navigate(-1)}
          _hover={{ bg: hoverBg }}
        >
          Retour
        </Button>

        <Grid templateColumns={{ base: '1fr', lg: '1.2fr 0.8fr' }} gap={8}>
          {/* Colonne principale */}
          <Box>
            {/* Image principale avec overlay */}
            <Box 
              position="relative" 
              borderRadius="xl" 
              overflow="hidden" 
              boxShadow="xl"
              mb={6}
              sx={fadeInStyle}
            >
              <AspectRatio ratio={16/9}>
                <Image
                  src={equipment.image || 'https://via.placeholder.com/1200x675?text=Engin+de+chantier'}
                  alt={equipment.name}
                  objectFit="cover"
                />
              </AspectRatio>
              
              {/* Overlay gradient */}
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                bgGradient="linear(to-t, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.1) 100%)"
                opacity={0.6}
              />
              
              {/* Badge disponibilité */}
              <Badge
                position="absolute"
                top={4}
                left={4}
                colorScheme={equipment.isAvailable ? "green" : "red"}
                px={3}
                py={1}
                borderRadius="full"
                fontSize="sm"
                fontWeight="bold"
                boxShadow="md"
              >
                <HStack spacing={1}>
                  {equipment.isAvailable ? <FaCheckCircle /> : <FaTimesCircle />}
                  <Text>{equipment.isAvailable ? 'Disponible' : 'Non disponible'}</Text>
                </HStack>
              </Badge>
              
              {/* Actions */}
              <HStack
                position="absolute"
                top={4}
                right={4}
                spacing={2}
                bg="whiteAlpha.900"
                p={2}
                borderRadius="full"
                boxShadow="md"
              >
                <Tooltip label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}>
                  <IconButton
                    aria-label="Favoris"
                    icon={isFavorite ? <FaHeart color="red" /> : <FaRegHeart />}
                    onClick={handleFavoriteToggle}
                    variant="ghost"
                    borderRadius="full"
                    _hover={{ bg: 'red.50' }}
                  />
                </Tooltip>
                <Tooltip label="Partager">
                  <IconButton
                    aria-label="Partager"
                    icon={<FaShare />}
                    onClick={handleShare}
                    variant="ghost"
                    borderRadius="full"
                    _hover={{ bg: 'blue.50' }}
                  />
                </Tooltip>
              </HStack>
            </Box>

            {/* Informations principales */}
            <Card 
              bg={cardBg} 
              borderRadius="xl" 
              boxShadow="lg" 
              overflow="hidden"
              mb={6}
              sx={fadeInStyle}
              opacity={0}
            >
              <CardBody p={6}>
                <VStack align="stretch" spacing={6}>
                  <Heading as="h1" size="xl" color={headingColor}>
                    {equipment.name}
                  </Heading>
                  
                  <Wrap spacing={3}>
                    <WrapItem>
                      <Tag size="lg" colorScheme="primary" borderRadius="full" px={4} py={2}>
                        <TagLeftIcon boxSize="12px" as={FaEuroSign} />
                        <TagLabel fontWeight="bold">{equipment.price}€/jour</TagLabel>
                      </Tag>
                    </WrapItem>
                    <WrapItem>
                      <Tag size="lg" colorScheme="blue" borderRadius="full" px={4} py={2}>
                        <TagLeftIcon boxSize="12px" as={FaTag} />
                        <TagLabel fontWeight="bold">{equipment.category}</TagLabel>
                      </Tag>
                    </WrapItem>
                    <WrapItem>
                      <Tag size="lg" colorScheme="purple" borderRadius="full" px={4} py={2}>
                        <TagLeftIcon boxSize="12px" as={FaMapMarkerAlt} />
                        <TagLabel fontWeight="bold">{equipment.location || 'Paris'}</TagLabel>
                      </Tag>
                    </WrapItem>
                  </Wrap>

                  <Text fontSize="lg" color={textColor} lineHeight="tall">
                    {equipment.description}
                  </Text>

                  <Divider />

                  <Box>
                    <Heading as="h2" size="md" mb={4} color={headingColor}>
                      Spécifications techniques
                    </Heading>
                    <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)" }} gap={4}>
                      <StatGroup>
                        <Stat>
                          <StatLabel>Marque</StatLabel>
                          <StatNumber fontSize="md">{equipment.specifications?.brand || 'N/A'}</StatNumber>
                        </Stat>
                        <Stat>
                          <StatLabel>Puissance</StatLabel>
                          <StatNumber fontSize="md">{equipment.specifications?.power || 'N/A'}</StatNumber>
                        </Stat>
                      </StatGroup>
                      <StatGroup>
                        <Stat>
                          <StatLabel>Poids</StatLabel>
                          <StatNumber fontSize="md">{equipment.specifications?.weight || 'N/A'}</StatNumber>
                        </Stat>
                        <Stat>
                          <StatLabel>Dimensions</StatLabel>
                          <StatNumber fontSize="md">{equipment.specifications?.dimensions || 'N/A'}</StatNumber>
                        </Stat>
                      </StatGroup>
                    </Grid>
                  </Box>
                </VStack>
              </CardBody>
            </Card>

            {/* Onglets */}
            <Card 
              bg={cardBg} 
              borderRadius="xl" 
              boxShadow="lg" 
              overflow="hidden"
              sx={fadeInStyle}
              opacity={0}
            >
              <CardBody p={0}>
                <Tabs 
                  index={tabIndex} 
                  onChange={setTabIndex}
                  variant="enclosed"
                  colorScheme="primary"
                >
                  <TabList px={6} pt={6}>
                    <Tab 
                      _selected={{ 
                        color: 'primary.500', 
                        bg: 'primary.50', 
                        fontWeight: 'bold',
                        borderTopRadius: 'lg',
                        borderBottomRadius: '0',
                        borderColor: 'primary.200',
                        borderBottom: 'none'
                      }}
                    >
                      Détails
                    </Tab>
                    <Tab 
                      _selected={{ 
                        color: 'primary.500', 
                        bg: 'primary.50', 
                        fontWeight: 'bold',
                        borderTopRadius: 'lg',
                        borderBottomRadius: '0',
                        borderColor: 'primary.200',
                        borderBottom: 'none'
                      }}
                    >
                      Avis ({reviews.length})
                    </Tab>
                  </TabList>

                  <TabPanels>
                    <TabPanel p={6}>
                      <VStack align="stretch" spacing={6}>
                        <Box>
                          <Heading as="h3" size="md" mb={3} color={headingColor}>
                            Description détaillée
                          </Heading>
                          <Text color={textColor} lineHeight="tall">
                            {equipment.description}
                          </Text>
                        </Box>
                        
                        <Box>
                          <Heading as="h3" size="md" mb={3} color={headingColor}>
                            Caractéristiques
                          </Heading>
                          <Wrap spacing={3}>
                            <WrapItem>
                              <Tag size="md" colorScheme="teal" borderRadius="full">
                                <TagLeftIcon boxSize="12px" as={FaTools} />
                                <TagLabel>Marque: {equipment.specifications?.brand || 'N/A'}</TagLabel>
                              </Tag>
                            </WrapItem>
                            <WrapItem>
                              <Tag size="md" colorScheme="teal" borderRadius="full">
                                <TagLeftIcon boxSize="12px" as={FaTachometerAlt} />
                                <TagLabel>Puissance: {equipment.specifications?.power || 'N/A'}</TagLabel>
                              </Tag>
                            </WrapItem>
                            <WrapItem>
                              <Tag size="md" colorScheme="teal" borderRadius="full">
                                <TagLeftIcon boxSize="12px" as={FaWeightHanging} />
                                <TagLabel>Poids: {equipment.specifications?.weight || 'N/A'}</TagLabel>
                              </Tag>
                            </WrapItem>
                            <WrapItem>
                              <Tag size="md" colorScheme="teal" borderRadius="full">
                                <TagLeftIcon boxSize="12px" as={FaRulerVertical} />
                                <TagLabel>Dimensions: {equipment.specifications?.dimensions || 'N/A'}</TagLabel>
                              </Tag>
                            </WrapItem>
                          </Wrap>
                        </Box>
                        
                        <Box>
                          <Heading as="h3" size="md" mb={3} color={headingColor}>
                            Calendrier de disponibilité
                          </Heading>
                          <TableContainer 
                            borderRadius="lg" 
                            borderWidth="1px" 
                            borderColor={borderColor}
                            overflow="hidden"
                          >
                            <Table variant="simple" size="sm">
                              <Thead bg={badgeBg}>
                                <Tr>
                                  <Th>Date</Th>
                                  <Th>Disponibilité</Th>
                                </Tr>
                              </Thead>
                              <Tbody>
                                {availability.map((item) => (
                                  <Tr key={item.date}>
                                    <Td>{new Date(item.date).toLocaleDateString('fr-FR')}</Td>
                                    <Td>
                                      <Badge 
                                        colorScheme={item.status === 'available' ? 'green' : 'red'}
                                        borderRadius="full"
                                        px={2}
                                      >
                                        {item.status === 'available' ? 'Disponible' : 'Indisponible'}
                                      </Badge>
                                    </Td>
                                  </Tr>
                                ))}
                              </Tbody>
                            </Table>
                          </TableContainer>
                          <Text fontSize="sm" color={textColor} mt={2}>
                            * Les disponibilités sont mises à jour quotidiennement
                          </Text>
                        </Box>
                      </VStack>
                    </TabPanel>

                    <TabPanel p={6}>
                      <VStack align="stretch" spacing={6}>
                        <Box 
                          bg={badgeBg} 
                          p={4} 
                          borderRadius="lg" 
                          borderWidth="1px" 
                          borderColor={borderColor}
                        >
                          <HStack spacing={3} mb={2}>
                            <FaStar color="gold" size="24px" />
                            <VStack align="start" spacing={0}>
                              <Heading as="h3" size="md" color={headingColor}>
                                Note moyenne: {averageRating.toFixed(1)}/5
                              </Heading>
                              <Text fontSize="sm" color={textColor}>
                                Basée sur {reviews.length} avis
                              </Text>
                            </VStack>
                          </HStack>
                          <HStack spacing={1}>
                            {[...Array(5)].map((_, i) => (
                              <FaStar
                                key={i}
                                color={i < Math.round(averageRating) ? 'gold' : 'gray.300'}
                                size="16px"
                              />
                            ))}
                          </HStack>
                        </Box>
                        
                        <List spacing={4}>
                          {reviews.map((review) => (
                            <ListItem key={review.id}>
                              <Card 
                                variant="outline" 
                                borderRadius="lg"
                                borderColor={borderColor}
                                _hover={{ 
                                  borderColor: accentColor,
                                  boxShadow: 'md',
                                  transform: 'translateY(-2px)',
                                  transition: 'all 0.2s'
                                }}
                              >
                                <CardBody>
                                  <HStack spacing={4} mb={3}>
                                    <Avatar 
                                      name={review.user} 
                                      bg={accentColor}
                                      color="white"
                                    />
                                    <VStack align="start" spacing={0}>
                                      <Text fontWeight="bold" color={headingColor}>
                                        {review.user}
                                      </Text>
                                      <Text fontSize="sm" color={textColor}>
                                        {review.date}
                                      </Text>
                                    </VStack>
                                  </HStack>
                                  <HStack spacing={1} mb={3}>
                                    {[...Array(5)].map((_, i) => (
                                      <FaStar
                                        key={i}
                                        color={i < review.rating ? 'gold' : 'gray.300'}
                                        size="14px"
                                      />
                                    ))}
                                  </HStack>
                                  <Text color={textColor}>{review.comment}</Text>
                                </CardBody>
                              </Card>
                            </ListItem>
                          ))}
                        </List>
                      </VStack>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </CardBody>
            </Card>
          </Box>

          {/* Colonne latérale */}
          <Box>
            {/* Carte de réservation */}
            <Card 
              bg={cardBg} 
              borderRadius="xl" 
              boxShadow="lg" 
              overflow="hidden"
              position="sticky"
              top={6}
              sx={fadeInStyle}
              opacity={0}
            >
              <CardHeader bg={accentColor} color="white" p={4}>
                <Heading size="md">Réserver cet équipement</Heading>
              </CardHeader>
              <CardBody p={6}>
                <VStack spacing={6} align="stretch">
                  <HStack spacing={4} justify="space-between">
                    <Text fontWeight="bold" fontSize="xl" color={headingColor}>
                      {equipment.price}€
                    </Text>
                    <Text color={textColor}>par jour</Text>
                  </HStack>
                  
                  <Divider />
                  
                  <VStack spacing={4} align="stretch">
                    <HStack>
                      <Box 
                        p={2} 
                        bg={badgeBg} 
                        color={badgeColor} 
                        borderRadius="full"
                      >
                        <FaCalendarAlt />
                      </Box>
                      <Text fontWeight="medium">Disponibilité: {equipment.isAvailable ? 'Immédiate' : 'Sur demande'}</Text>
                    </HStack>
                    
                    <HStack>
                      <Box 
                        p={2} 
                        bg={badgeBg} 
                        color={badgeColor} 
                        borderRadius="full"
                      >
                        <FaShieldAlt />
                      </Box>
                      <Text fontWeight="medium">Garantie de remboursement</Text>
                    </HStack>
                    
                    <HStack>
                      <Box 
                        p={2} 
                        bg={badgeBg} 
                        color={badgeColor} 
                        borderRadius="full"
                      >
                        <FaTruck />
                      </Box>
                      <Text fontWeight="medium">Livraison possible</Text>
                    </HStack>
                  </VStack>
                  
                  <Button
                    colorScheme="primary"
                    size="lg"
                    height="60px"
                    onClick={onOpen}
                    isDisabled={!equipment.isAvailable}
                    leftIcon={<FaCalendarCheck />}
                    _hover={{
                      transform: 'translateY(-2px)',
                      boxShadow: 'lg',
                    }}
                    sx={equipment.isAvailable ? pulseStyle : undefined}
                  >
                    {equipment.isAvailable ? 'Réserver maintenant' : 'Non disponible'}
                  </Button>
                  
                  <Text fontSize="sm" color={textColor} textAlign="center">
                    Aucun paiement requis jusqu'à la confirmation
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          </Box>
        </Grid>
      </Container>

      {/* Modal de réservation */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent borderRadius="xl">
          <ModalHeader borderBottomWidth="1px" borderColor={borderColor}>
            Demande de location
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            <VStack spacing={6}>
              <FormControl isRequired>
                <FormLabel fontWeight="medium">Date de début</FormLabel>
                <Input
                  name="startDate"
                  type="date"
                  value={startDate}
                  onChange={handleDateChange}
                  borderRadius="lg"
                  size="lg"
                  _focus={{ borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}` }}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontWeight="medium">Date de fin</FormLabel>
                <Input
                  name="endDate"
                  type="date"
                  value={endDate}
                  onChange={handleDateChange}
                  borderRadius="lg"
                  size="lg"
                  _focus={{ borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}` }}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontWeight="medium">Message (optionnel)</FormLabel>
                <Textarea
                  value={message}
                  onChange={handleMessageChange}
                  placeholder="Ajoutez un message pour le propriétaire..."
                  borderRadius="lg"
                  size="lg"
                  rows={4}
                  _focus={{ borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}` }}
                />
              </FormControl>
              {error && (
                <Alert status="error" borderRadius="lg">
                  <AlertIcon />
                  {error}
                </Alert>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter borderTopWidth="1px" borderColor={borderColor} py={4}>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Annuler
            </Button>
            <Button
              colorScheme="primary"
              onClick={handleRentalSubmit}
              isLoading={loading}
              loadingText="Envoi en cours..."
              leftIcon={<FaCheck />}
              size="lg"
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: 'lg',
              }}
            >
              Envoyer la demande
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default EquipmentDetails; 