import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Heading,
  SimpleGrid,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  Textarea,
  Select,
  useToast,
  Badge,
  HStack,
  VStack,
  Text,
} from '@chakra-ui/react';
import { FaTools, FaPlus, FaTrash } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Equipment } from '../types';
import * as equipmentService from '../services/equipmentService';

const MaintenanceManagement: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const [maintenanceForm, setMaintenanceForm] = useState({
    date: '',
    description: '',
    cost: 0,
    performedBy: '',
    type: 'PREVENTIVE' as 'PREVENTIVE' | 'CORRECTIVE' | 'PREDICTIVE',
  });

  const [maintenanceToDelete, setMaintenanceToDelete] = useState<{ equipmentId: string; index: number } | null>(null);
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure();

  interface Maintenance {
    date: string;
    description: string;
    cost: number;
    performedBy: string;
    type: 'PREVENTIVE' | 'CORRECTIVE' | 'PREDICTIVE';
  }

  useEffect(() => {
    const loadEquipment = async () => {
      try {
        if (user?.id) {
          const data = await equipmentService.getEquipmentsByOwner(user.id);
          setEquipment(data);
        }
      } catch (error) {
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les équipements',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    loadEquipment();
  }, [user, toast]);

  const handleAddMaintenance = async () => {
    if (!selectedEquipment) return;

    try {
      const updatedEquipment = {
        ...selectedEquipment,
        maintenanceHistory: [
          ...(selectedEquipment.maintenanceHistory || []),
          {
            ...maintenanceForm,
            date: new Date(maintenanceForm.date).toISOString(),
            type: maintenanceForm.type,
          },
        ],
      };

      await equipmentService.updateEquipment(selectedEquipment.id, updatedEquipment);
      
      setEquipment(equipment.map(eq => 
        eq.id === selectedEquipment.id ? updatedEquipment : eq
      ));

      toast({
        title: 'Succès',
        description: 'Maintenance ajoutée avec succès',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onClose();
      setMaintenanceForm({
        date: '',
        description: '',
        cost: 0,
        performedBy: '',
        type: 'PREVENTIVE',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ajouter la maintenance',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDeleteMaintenance = async (equipmentId: string, maintenanceIndex: number) => {
    try {
      const equipmentToUpdate = equipment.find(eq => eq.id === equipmentId);
      if (!equipmentToUpdate || !equipmentToUpdate.maintenanceHistory) return;

      const updatedMaintenanceHistory = [
        ...equipmentToUpdate.maintenanceHistory.slice(0, maintenanceIndex),
        ...equipmentToUpdate.maintenanceHistory.slice(maintenanceIndex + 1),
      ];

      const updatedEquipment = {
        ...equipmentToUpdate,
        maintenanceHistory: updatedMaintenanceHistory,
      };

      await equipmentService.updateEquipment(equipmentId, updatedEquipment);
      
      setEquipment(equipment.map(eq => 
        eq.id === equipmentId ? updatedEquipment : eq
      ));

      toast({
        title: 'Succès',
        description: 'Maintenance supprimée avec succès',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer la maintenance',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDeleteClick = (equipmentId: string, index: number) => {
    setMaintenanceToDelete({ equipmentId, index });
    onDeleteModalOpen();
  };

  const handleConfirmDelete = () => {
    if (maintenanceToDelete) {
      handleDeleteMaintenance(maintenanceToDelete.equipmentId, maintenanceToDelete.index);
      onDeleteModalClose();
      setMaintenanceToDelete(null);
    }
  };

  const getMaintenanceTypeColor = (type: string) => {
    switch (type) {
      case 'PREVENTIVE':
        return 'blue';
      case 'CORRECTIVE':
        return 'red';
      case 'PREDICTIVE':
        return 'green';
      default:
        return 'gray';
    }
  };

  return (
    <Container maxW="container.xl" py={8}>
      <Box mb={8}>
        <Heading size="xl" mb={6}>Gestion des maintenances</Heading>
        
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Coût total</StatLabel>
                <StatNumber color="blue.600">
                  {equipment.reduce((sum, eq) => 
                    sum + (eq.maintenanceHistory?.reduce((cost, m) => cost + m.cost, 0) || 0), 0
                  ).toLocaleString('fr-FR')} €
                </StatNumber>
                <StatHelpText>
                  Dépenses totales en maintenance
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Nombre d'interventions</StatLabel>
                <StatNumber color="green.600">
                  {equipment.reduce((sum, eq) => 
                    sum + (eq.maintenanceHistory?.length || 0), 0
                  )}
                </StatNumber>
                <StatHelpText>
                  Total des maintenances effectuées
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Coût moyen</StatLabel>
                <StatNumber color="purple.600">
                  {(() => {
                    const totalCost = equipment.reduce((sum, eq) => 
                      sum + (eq.maintenanceHistory?.reduce((cost, m) => cost + m.cost, 0) || 0), 0
                    );
                    const totalInterventions = equipment.reduce((sum, eq) => 
                      sum + (eq.maintenanceHistory?.length || 0), 0
                    );
                    return totalInterventions > 0 
                      ? (totalCost / totalInterventions).toLocaleString('fr-FR')
                      : '0';
                  })()} €
                </StatNumber>
                <StatHelpText>
                  Coût moyen par intervention
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Dernière maintenance</StatLabel>
                <StatNumber color="orange.600">
                  {(() => {
                    const lastMaintenance = equipment
                      .flatMap(eq => eq.maintenanceHistory || [])
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
                    return lastMaintenance ? new Date(lastMaintenance.date).toLocaleDateString('fr-FR') : 'Aucune';
                  })()}
                </StatNumber>
                <StatHelpText>
                  Date de la dernière intervention
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        <Button
          leftIcon={<FaPlus />}
          colorScheme="blue"
          mb={6}
          onClick={() => {
            setSelectedEquipment(null);
            setMaintenanceForm({
              date: '',
              description: '',
              cost: 0,
              performedBy: '',
              type: 'PREVENTIVE',
            });
            onOpen();
          }}
        >
          Ajouter une maintenance
        </Button>

        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Équipement</Th>
              <Th>Date</Th>
              <Th>Type</Th>
              <Th>Description</Th>
              <Th>Coût</Th>
              <Th>Technicien</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {equipment.flatMap(eq => 
              eq.maintenanceHistory?.map((maintenance, index) => (
                <Tr key={`${eq.id}-${index}`}>
                  <Td>{eq.name}</Td>
                  <Td>{new Date(maintenance.date).toLocaleDateString('fr-FR')}</Td>
                  <Td>
                    <Badge colorScheme={getMaintenanceTypeColor(maintenance.type)}>
                      {maintenance.type === 'PREVENTIVE' ? 'Préventive' :
                       maintenance.type === 'CORRECTIVE' ? 'Corrective' : 'Prédictive'}
                    </Badge>
                  </Td>
                  <Td>{maintenance.description}</Td>
                  <Td>{maintenance.cost.toLocaleString('fr-FR')} €</Td>
                  <Td>{maintenance.performedBy}</Td>
                  <Td>
                    <Button
                      leftIcon={<FaTrash />}
                      colorScheme="red"
                      size="sm"
                      onClick={() => handleDeleteClick(eq.id, index)}
                    >
                      Supprimer
                    </Button>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay 
          backdropFilter="blur(8px)" 
          bg="blackAlpha.600" 
          transition="all 0.3s"
        />
        <ModalContent 
          borderRadius="2xl" 
          overflow="hidden"
          boxShadow="2xl"
          border="1px solid"
          borderColor="blue.100"
          transition="all 0.3s"
          _hover={{ transform: "translateY(-2px)", boxShadow: "3xl" }}
        >
          <ModalHeader 
            bg="blue.50" 
            py={6}
            borderBottom="1px solid"
            borderColor="blue.100"
            position="relative"
            _before={{
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "linear-gradient(45deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%)",
              zIndex: 1
            }}
          >
            <HStack spacing={3} position="relative" zIndex={2}>
              <Box color="blue.500">
                <FaTools />
              </Box>
              <VStack align="start" spacing={1}>
                <Text fontWeight="semibold" color="blue.700" fontSize="xl">
                  Ajouter une maintenance
                </Text>
                <Text fontSize="sm" color="blue.600">
                  Remplissez les détails de la nouvelle maintenance
                </Text>
              </VStack>
            </HStack>
          </ModalHeader>
          <ModalCloseButton 
            color="blue.500"
            _hover={{ bg: "blue.50" }}
            top={6}
            right={6}
          />
          <ModalBody py={8}>
            <VStack spacing={6}>
              <FormControl isRequired>
                <FormLabel color="gray.700" fontWeight="medium">Équipement</FormLabel>
                <Select
                  placeholder="Sélectionner un équipement"
                  value={selectedEquipment?.id}
                  onChange={(e) => {
                    const eq = equipment.find(eq => eq.id === e.target.value);
                    setSelectedEquipment(eq || null);
                  }}
                  borderColor="gray.200"
                  _hover={{ borderColor: "blue.300" }}
                  _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
                >
                  {equipment.map(eq => (
                    <option key={eq.id} value={eq.id}>{eq.name}</option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel color="gray.700" fontWeight="medium">Date</FormLabel>
                <Input
                  type="date"
                  value={maintenanceForm.date}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, date: e.target.value })}
                  borderColor="gray.200"
                  _hover={{ borderColor: "blue.300" }}
                  _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel color="gray.700" fontWeight="medium">Type de maintenance</FormLabel>
                <Select
                  value={maintenanceForm.type}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, type: e.target.value as any })}
                  borderColor="gray.200"
                  _hover={{ borderColor: "blue.300" }}
                  _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
                >
                  <option value="PREVENTIVE">Préventive</option>
                  <option value="CORRECTIVE">Corrective</option>
                  <option value="PREDICTIVE">Prédictive</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel color="gray.700" fontWeight="medium">Description</FormLabel>
                <Textarea
                  value={maintenanceForm.description}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, description: e.target.value })}
                  placeholder="Décrivez les travaux effectués..."
                  borderColor="gray.200"
                  _hover={{ borderColor: "blue.300" }}
                  _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel color="gray.700" fontWeight="medium">Coût (€)</FormLabel>
                <NumberInput
                  value={maintenanceForm.cost}
                  onChange={(value) => setMaintenanceForm({ ...maintenanceForm, cost: Number(value) })}
                  min={0}
                >
                  <NumberInputField
                    borderColor="gray.200"
                    _hover={{ borderColor: "blue.300" }}
                    _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
                  />
                </NumberInput>
              </FormControl>

              <FormControl isRequired>
                <FormLabel color="gray.700" fontWeight="medium">Technicien</FormLabel>
                <Input
                  value={maintenanceForm.performedBy}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, performedBy: e.target.value })}
                  placeholder="Nom du technicien"
                  borderColor="gray.200"
                  _hover={{ borderColor: "blue.300" }}
                  _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter 
            borderTop="1px solid"
            borderColor="blue.100"
            py={4}
          >
            <HStack spacing={4} w="full" justify="flex-end">
              <Button
                variant="outline"
                colorScheme="blue"
                onClick={onClose}
                px={6}
                borderRadius="full"
                borderWidth="2px"
                _hover={{ bg: "blue.50" }}
              >
                Annuler
              </Button>
              <Button
                colorScheme="blue"
                onClick={handleAddMaintenance}
                px={6}
                borderRadius="full"
                bgGradient="linear(to-r, blue.500, blue.600)"
                _hover={{
                  bgGradient: "linear(to-r, blue.600, blue.700)",
                  transform: "translateY(-1px)",
                  boxShadow: "lg"
                }}
                _active={{
                  transform: "translateY(0)",
                  boxShadow: "md"
                }}
              >
                Ajouter
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={onDeleteModalClose} size="md">
        <ModalOverlay 
          backdropFilter="blur(8px)" 
          bg="blackAlpha.600" 
        />
        <ModalContent 
          borderRadius="2xl" 
          overflow="hidden"
          boxShadow="2xl"
          border="1px solid"
          borderColor="red.100"
        >
          <ModalHeader 
            bg="red.50" 
            py={6}
            borderBottom="1px solid"
            borderColor="red.100"
          >
            <HStack spacing={3}>
              <Box color="red.500">
                <FaTrash />
              </Box>
              <Text fontWeight="semibold" color="red.700">
                Confirmer la suppression
              </Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton 
            color="red.500"
            _hover={{ bg: "red.50" }}
          />
          <ModalBody py={8}>
            <VStack spacing={4} align="center">
              <Box 
                p={4} 
                borderRadius="full" 
                bg="red.50"
                color="red.500"
              >
                <FaTrash size="24px" />
              </Box>
              <Text 
                textAlign="center" 
                color="gray.600"
                fontWeight="medium"
              >
                Êtes-vous sûr de vouloir supprimer cette maintenance ?
                <br />
                Cette action est irréversible.
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter 
            borderTop="1px solid"
            borderColor="red.100"
            py={4}
          >
            <HStack spacing={4} w="full" justify="center">
              <Button
                variant="outline"
                colorScheme="red"
                onClick={onDeleteModalClose}
                px={8}
                borderRadius="full"
                borderWidth="2px"
                _hover={{ bg: "red.50" }}
              >
                Annuler
              </Button>
              <Button
                colorScheme="red"
                onClick={handleConfirmDelete}
                px={8}
                borderRadius="full"
                bgGradient="linear(to-r, red.500, red.600)"
                _hover={{
                  bgGradient: "linear(to-r, red.600, red.700)",
                  transform: "translateY(-1px)",
                  boxShadow: "lg"
                }}
                _active={{
                  transform: "translateY(0)",
                  boxShadow: "md"
                }}
              >
                Supprimer
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default MaintenanceManagement; 