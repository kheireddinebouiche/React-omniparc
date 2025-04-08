import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Box,
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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  FormControl,
  FormLabel,
  Select,
  Divider,
  Stack,
  Text,
  useDisclosure,
  VStack,
  HStack,
  InputGroup,
  InputLeftElement,
  InputRightElement,
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { RootState, AppDispatch } from '../store';
import { EquipmentState } from '../store/slices/equipmentSlice';
import { addEquipment, updateEquipment, deleteEquipment } from '../store/slices/equipmentSlice';
import { Equipment } from '../types';

const categories = [
  'Pelle mécanique',
  'Chargeuse',
  'Niveleuse',
  'Bulldozer',
  'Grue',
  'Camion-benne',
  'Compacteur',
  'Autre',
];

const EquipmentManagement = () => {
  const dispatch = useDispatch<AppDispatch>();
  const equipment = useSelector((state: RootState) => (state.equipment as EquipmentState).items);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [formData, setFormData] = useState<Partial<Equipment>>({
    name: '',
    description: '',
    price: 0,
    category: '',
    specifications: {
      poids: '',
      hauteur: '',
      capacite: '',
      annee: '',
      moteur: '',
      puissance: '',
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.id) {
      dispatch(updateEquipment(formData as Equipment));
    } else {
      dispatch(addEquipment(formData as Equipment));
    }
    onClose();
  };

  const handleDelete = (id: string) => {
    dispatch(deleteEquipment(id));
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading as="h1" size="xl" mb={4}>
            Gestion des équipements
          </Heading>
        </Box>
        <Box>
          <Button
            colorScheme="blue"
            leftIcon={<AddIcon />}
            onClick={onOpen}
          >
            Ajouter un équipement
          </Button>
        </Box>
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Nom</Th>
                <Th>Catégorie</Th>
                <Th>Prix</Th>
                <Th>Spécifications</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {equipment.map((item: Equipment) => (
                <Tr key={item.id}>
                  <Td>{item.name}</Td>
                  <Td>{item.category}</Td>
                  <Td>{item.price} €/jour</Td>
                  <Td>
                    <VStack align="start" spacing={1}>
                      {Object.entries(item.specifications).map(([key, value]) => (
                        <HStack key={key} spacing={2}>
                          <Text fontSize="sm" color="gray.500" textTransform="capitalize">
                            {key}:
                          </Text>
                          <Text fontSize="sm">
                            {value}
                          </Text>
                        </HStack>
                      ))}
                    </VStack>
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      <IconButton
                        aria-label="Modifier"
                        icon={<EditIcon />}
                        size="sm"
                        colorScheme="blue"
                        onClick={() => {
                          setFormData(item);
                          onOpen();
                        }}
                      />
                      <IconButton
                        aria-label="Supprimer"
                        icon={<DeleteIcon />}
                        size="sm"
                        colorScheme="red"
                        onClick={() => handleDelete(item.id)}
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {formData.id ? 'Modifier l\'équipement' : 'Ajouter un équipement'}
          </ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleSubmit}>
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Nom</FormLabel>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Catégorie</FormLabel>
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Description</FormLabel>
                  <Input
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Prix par jour</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      €
                    </InputLeftElement>
                    <Input
                      name="price"
                      type="number"
                      value={formData.price}
                      onChange={handleChange}
                    />
                  </InputGroup>
                </FormControl>
                <Divider />
                <Heading size="md">Spécifications techniques</Heading>
                <FormControl>
                  <FormLabel>Poids</FormLabel>
                  <InputGroup>
                    <Input
                      value={formData.specifications?.poids}
                      onChange={(e) => handleSpecificationChange('poids', e.target.value)}
                    />
                    <InputRightElement>kg</InputRightElement>
                  </InputGroup>
                </FormControl>
                <FormControl>
                  <FormLabel>Hauteur</FormLabel>
                  <InputGroup>
                    <Input
                      value={formData.specifications?.hauteur}
                      onChange={(e) => handleSpecificationChange('hauteur', e.target.value)}
                    />
                    <InputRightElement>m</InputRightElement>
                  </InputGroup>
                </FormControl>
                <FormControl>
                  <FormLabel>Capacité</FormLabel>
                  <InputGroup>
                    <Input
                      value={formData.specifications?.capacite}
                      onChange={(e) => handleSpecificationChange('capacite', e.target.value)}
                    />
                    <InputRightElement>m³</InputRightElement>
                  </InputGroup>
                </FormControl>
                <FormControl>
                  <FormLabel>Année de fabrication</FormLabel>
                  <Input
                    value={formData.specifications?.annee}
                    onChange={(e) => handleSpecificationChange('annee', e.target.value)}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Type de moteur</FormLabel>
                  <Input
                    value={formData.specifications?.moteur}
                    onChange={(e) => handleSpecificationChange('moteur', e.target.value)}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Puissance</FormLabel>
                  <InputGroup>
                    <Input
                      value={formData.specifications?.puissance}
                      onChange={(e) => handleSpecificationChange('puissance', e.target.value)}
                    />
                    <InputRightElement>ch</InputRightElement>
                  </InputGroup>
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Annuler
              </Button>
              <Button colorScheme="blue" type="submit">
                {formData.id ? 'Modifier' : 'Ajouter'}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default EquipmentManagement; 