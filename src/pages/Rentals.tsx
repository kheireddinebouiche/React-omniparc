import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Container,
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  SimpleGrid,
  Card,
  CardBody,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Spinner,
  Center,
  useToast,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  IconButton,
  Tooltip,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  ScaleFade,
} from '@chakra-ui/react';
import {
  FaSearch,
  FaFilter,
  FaInfoCircle,
  FaCheck,
  FaTimes,
  FaPrint,
  FaCalendarAlt,
  FaEuroSign,
  FaUser,
} from 'react-icons/fa';
import { RootState } from '../store';
import { User, RentalRequest, Equipment } from '../types';
import { getRentalRequestsByUser, getRentalRequestsByEquipment, approveRentalRequest, cancelRentalRequest } from '../services/rentalService';
import * as equipmentService from '../services/equipmentService';

const Rentals: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth) as { user: User | null };
  const toast = useToast();
  const [rentalRequests, setRentalRequests] = useState<RentalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [equipmentMap, setEquipmentMap] = useState<Record<string, Equipment>>({});
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<RentalRequest | null>(null);
  const { isOpen: isDetailsModalOpen, onOpen: onDetailsModalOpen, onClose: onDetailsModalClose } = useDisclosure();

  // Couleurs et styles
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        // Charger les équipements
        const equipments = await equipmentService.getEquipments();
        const equipmentMap = equipments.reduce((acc, eq) => ({ ...acc, [eq.id]: eq }), {});
        setEquipmentMap(equipmentMap);

        // Charger les demandes de location
        let requests: RentalRequest[] = [];
        if (user.role === 'PROFESSIONAL') {
          // Pour les propriétaires, charger les demandes de leurs équipements
          const ownerEquipments = equipments.filter(eq => eq.ownerId === user.id);
          const equipmentRequests = await Promise.all(
            ownerEquipments.map(eq => getRentalRequestsByEquipment(eq.id))
          );
          requests = equipmentRequests.flat();
        } else {
          // Pour les clients, charger leurs demandes
          requests = await getRentalRequestsByUser(user.id);
        }
        setRentalRequests(requests);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les données",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, toast]);

  const handleViewDetails = (request: RentalRequest) => {
    setSelectedRequest(request);
    onDetailsModalOpen();
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      await approveRentalRequest(requestId);
      setRentalRequests(prev => prev.map(request => 
        request.id === requestId 
          ? { ...request, status: 'APPROVED' }
          : request
      ));
      toast({
        title: "Demande approuvée",
        description: "La demande de location a été approuvée avec succès",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Erreur lors de l\'approbation de la demande:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'approbation de la demande",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    try {
      await cancelRentalRequest(requestId);
      setRentalRequests(prev => prev.map(request => 
        request.id === requestId 
          ? { ...request, status: 'REJECTED' }
          : request
      ));
      toast({
        title: "Demande refusée",
        description: "La demande de location a été refusée avec succès",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Erreur lors du refus de la demande:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du refus de la demande",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Filtrage des demandes
  const filteredRequests = rentalRequests.filter(request => {
    if (filterStatus && request.status !== filterStatus) return false;
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

  // Statistiques
  const stats = {
    total: rentalRequests.length,
    pending: rentalRequests.filter(r => r.status === 'PENDING').length,
    approved: rentalRequests.filter(r => r.status === 'APPROVED').length,
    rejected: rentalRequests.filter(r => r.status === 'REJECTED').length
  };

  if (!user) return null;

  return (
    <Container maxW="container.xl" py={8}>
      <ScaleFade in={true} initialScale={0.9}>
        <Box mb={8}>
          <Heading as="h1" size="xl" mb={2}>Gestion des locations</Heading>
          <Text color={textColor}>
            Gérez vos demandes de location et suivez leur statut
          </Text>
        </Box>

        {/* Statistiques */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
          <Card bg={cardBg} borderRadius="xl" boxShadow="md">
            <CardBody>
              <Stat>
                <StatLabel>Total des demandes</StatLabel>
                <StatNumber>{stats.total}</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  23.36%
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          <Card bg={cardBg} borderRadius="xl" boxShadow="md">
            <CardBody>
              <Stat>
                <StatLabel>En attente</StatLabel>
                <StatNumber>{stats.pending}</StatNumber>
                <StatHelpText>
                  <StatArrow type="decrease" />
                  9.05%
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          <Card bg={cardBg} borderRadius="xl" boxShadow="md">
            <CardBody>
              <Stat>
                <StatLabel>Approuvées</StatLabel>
                <StatNumber>{stats.approved}</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  12.5%
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          <Card bg={cardBg} borderRadius="xl" boxShadow="md">
            <CardBody>
              <Stat>
                <StatLabel>Refusées</StatLabel>
                <StatNumber>{stats.rejected}</StatNumber>
                <StatHelpText>
                  <StatArrow type="decrease" />
                  4.5%
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Filtres et recherche */}
        <Card mb={8} bg={cardBg} borderRadius="xl" boxShadow="md">
          <CardBody>
            <HStack spacing={4}>
              <InputGroup maxW="300px">
                <InputLeftElement pointerEvents="none">
                  <FaSearch color="gray.300" />
                </InputLeftElement>
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
              <Select
                maxW="200px"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">Tous les statuts</option>
                <option value="PENDING">En attente</option>
                <option value="APPROVED">Approuvées</option>
                <option value="REJECTED">Refusées</option>
              </Select>
            </HStack>
          </CardBody>
        </Card>

        {/* Liste des demandes */}
        <Card bg={cardBg} borderRadius="xl" boxShadow="md">
          <CardBody>
            {loading ? (
              <Center py={10}>
                <Spinner size="xl" color="blue.500" thickness="4px" />
              </Center>
            ) : filteredRequests.length > 0 ? (
              <TableContainer>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Équipement</Th>
                      <Th>Date de début</Th>
                      <Th>Date de fin</Th>
                      <Th>Statut</Th>
                      <Th>Type</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredRequests.map((request) => (
                      <Tr key={request.id}>
                        <Td>
                          {equipmentMap[request.equipmentId]?.name || 'Équipement inconnu'}
                        </Td>
                        <Td>{new Date(request.startDate).toLocaleDateString()}</Td>
                        <Td>{new Date(request.endDate).toLocaleDateString()}</Td>
                        <Td>
                          <Badge
                            colorScheme={
                              request.status === 'PENDING' ? 'yellow' :
                              request.status === 'APPROVED' ? 'green' : 'red'
                            }
                          >
                            {request.status === 'PENDING' ? 'En attente' :
                             request.status === 'APPROVED' ? 'Approuvée' : 'Refusée'}
                          </Badge>
                        </Td>
                        <Td>
                          <Badge colorScheme={request.userId === user.id ? 'blue' : 'green'}>
                            {request.userId === user.id ? 'Demandeur' : 'Propriétaire'}
                          </Badge>
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            <Tooltip label="Voir les détails">
                              <IconButton
                                aria-label="Détails"
                                icon={<FaInfoCircle />}
                                size="sm"
                                colorScheme="blue"
                                onClick={() => handleViewDetails(request)}
                              />
                            </Tooltip>

                            {user.role === 'PROFESSIONAL' && 
                             equipmentMap[request.equipmentId]?.ownerId === user.id && 
                             request.status === 'PENDING' && (
                              <>
                                <Tooltip label="Approuver">
                                  <IconButton
                                    aria-label="Approuver"
                                    icon={<FaCheck />}
                                    size="sm"
                                    colorScheme="green"
                                    onClick={() => handleApproveRequest(request.id)}
                                  />
                                </Tooltip>
                                <Tooltip label="Refuser">
                                  <IconButton
                                    aria-label="Refuser"
                                    icon={<FaTimes />}
                                    size="sm"
                                    colorScheme="red"
                                    onClick={() => handleCancelRequest(request.id)}
                                  />
                                </Tooltip>
                              </>
                            )}

                            {request.status === 'APPROVED' && (
                              <Tooltip label="Imprimer la facture">
                                <IconButton
                                  aria-label="Facture"
                                  icon={<FaPrint />}
                                  size="sm"
                                  colorScheme="purple"
                                  onClick={() => {/* TODO: Implémenter l'impression de facture */}}
                                />
                              </Tooltip>
                            )}
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            ) : (
              <Center py={10}>
                <VStack spacing={4}>
                  <FaCalendarAlt size={48} color="gray" />
                  <Text color={textColor}>Aucune demande de location trouvée</Text>
                </VStack>
              </Center>
            )}
          </CardBody>
        </Card>
      </ScaleFade>

      {/* Modal de détails */}
      <Modal isOpen={isDetailsModalOpen} onClose={onDetailsModalClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Détails de la demande</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedRequest && (
              <VStack align="stretch" spacing={4}>
                <Box p={4} bg="gray.50" borderRadius="md">
                  <Heading size="sm" mb={4}>Informations de l'équipement</Heading>
                  <SimpleGrid columns={2} spacing={4}>
                    <Box>
                      <Text fontWeight="bold">Équipement</Text>
                      <Text>{equipmentMap[selectedRequest.equipmentId]?.name}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold">Catégorie</Text>
                      <Text>{equipmentMap[selectedRequest.equipmentId]?.category}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold">Prix journalier</Text>
                      <Text>{equipmentMap[selectedRequest.equipmentId]?.price} €</Text>
                    </Box>
                  </SimpleGrid>
                </Box>

                <Box p={4} bg="gray.50" borderRadius="md">
                  <Heading size="sm" mb={4}>Période de location</Heading>
                  <SimpleGrid columns={2} spacing={4}>
                    <Box>
                      <Text fontWeight="bold">Date de début</Text>
                      <Text>{new Date(selectedRequest.startDate).toLocaleDateString()}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold">Date de fin</Text>
                      <Text>{new Date(selectedRequest.endDate).toLocaleDateString()}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold">Durée</Text>
                      <Text>
                        {Math.ceil(
                          (new Date(selectedRequest.endDate).getTime() - new Date(selectedRequest.startDate).getTime()) / 
                          (1000 * 60 * 60 * 24)
                        )} jours
                      </Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold">Coût total estimé</Text>
                      <Text>
                        {Math.ceil(
                          (new Date(selectedRequest.endDate).getTime() - new Date(selectedRequest.startDate).getTime()) / 
                          (1000 * 60 * 60 * 24)
                        ) * (equipmentMap[selectedRequest.equipmentId]?.price || 0)} €
                      </Text>
                    </Box>
                  </SimpleGrid>
                </Box>

                {selectedRequest.message && (
                  <Box p={4} bg="gray.50" borderRadius="md">
                    <Heading size="sm" mb={4}>Message</Heading>
                    <Text>{selectedRequest.message}</Text>
                  </Box>
                )}

                <Box p={4} bg="gray.50" borderRadius="md">
                  <Heading size="sm" mb={4}>Statut</Heading>
                  <Badge
                    colorScheme={
                      selectedRequest.status === 'PENDING' ? 'yellow' :
                      selectedRequest.status === 'APPROVED' ? 'green' : 'red'
                    }
                    p={2}
                    borderRadius="md"
                  >
                    {selectedRequest.status === 'PENDING' ? 'En attente' :
                     selectedRequest.status === 'APPROVED' ? 'Approuvée' : 'Refusée'}
                  </Badge>
                </Box>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDetailsModalClose}>
              Fermer
            </Button>
            {selectedRequest?.status === 'APPROVED' && (
              <Button
                colorScheme="blue"
                leftIcon={<FaPrint />}
                onClick={() => {/* TODO: Implémenter l'impression de facture */}}
              >
                Imprimer la facture
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default Rentals; 