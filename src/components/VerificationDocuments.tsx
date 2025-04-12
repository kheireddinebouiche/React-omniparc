import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  VStack,
  HStack,
  Icon,
  useToast,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useColorModeValue,
  Divider,
  Progress,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Flex,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Select,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';
import { 
  FaFileUpload, 
  FaEye, 
  FaTrash, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaClock, 
  FaHistory, 
  FaFilter,
  FaDownload,
  FaInfoCircle,
  FaExclamationTriangle,
  FaFileAlt,
  FaIdCard,
  FaBriefcase,
  FaShieldAlt,
  FaCertificate,
  FaEllipsisV,
  FaPlus,
  FaSearch,
} from 'react-icons/fa';
import { verificationService } from '../services/verificationService';
import { VerificationDocument, VerificationHistory, DocumentType } from '../types';
import { VerificationStatus } from '../types/enums';

interface VerificationDocumentsProps {
  userId: string;
}

export const VerificationDocuments: React.FC<VerificationDocumentsProps> = ({ userId }) => {
  const [documents, setDocuments] = useState<VerificationDocument[]>([]);
  const [history, setHistory] = useState<VerificationHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<VerificationDocument | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  
  // Couleurs et styles
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const headingColor = useColorModeValue('gray.700', 'white');

  useEffect(() => {
    loadDocuments();
    loadHistory();
  }, [userId]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const docs = await verificationService.getVerificationDocuments(userId);
      setDocuments(docs);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les documents',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const hist = await verificationService.getVerificationHistory(userId);
      setHistory(hist);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await verificationService.uploadVerificationDocument(userId, file, verificationService.getDocumentType(file.name));
      toast({
        title: 'Succès',
        description: 'Document téléchargé avec succès',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      loadDocuments();
      loadHistory();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de télécharger le document',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleViewDocument = (document: VerificationDocument) => {
    setSelectedDocument(document);
    onOpen();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'green';
      case 'PENDING':
        return 'yellow';
      case 'REJECTED':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'Approuvé';
      case 'PENDING':
        return 'En attente';
      case 'REJECTED':
        return 'Rejeté';
      default:
        return status;
    }
  };

  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case 'ID_CARD':
        return <Icon as={FaIdCard} />;
      case 'BUSINESS_LICENSE':
        return <Icon as={FaBriefcase} />;
      case 'INSURANCE':
        return <Icon as={FaShieldAlt} />;
      case 'PROFESSIONAL_CERTIFICATION':
        return <Icon as={FaCertificate} />;
      default:
        return <Icon as={FaFileAlt} />;
    }
  };

  const getDocumentTypeText = (type: string) => {
    switch (type) {
      case 'ID_CARD':
        return 'Pièce d\'identité';
      case 'BUSINESS_LICENSE':
        return 'Licence professionnelle';
      case 'INSURANCE':
        return 'Assurance';
      case 'PROFESSIONAL_CERTIFICATION':
        return 'Certification professionnelle';
      default:
        return type;
    }
  };

  const filteredDocuments = documents.filter(doc => {
    if (filterStatus !== 'all' && doc.status !== filterStatus) return false;
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        doc.name.toLowerCase().includes(searchLower) ||
        getDocumentTypeText(doc.type).toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const stats = {
    total: documents.length,
    approved: documents.filter(doc => doc.status === 'APPROVED').length,
    pending: documents.filter(doc => doc.status === 'PENDING').length,
    rejected: documents.filter(doc => doc.status === 'REJECTED').length,
    verificationProgress: documents.length > 0 
      ? Math.round((documents.filter(doc => doc.status === 'APPROVED').length / documents.length) * 100) 
      : 0
  };

  if (loading) {
    return (
      <Center h="200px">
        <Spinner size="xl" color="blue.500" thickness="4px" />
      </Center>
    );
  }

  return (
    <Box>
      {/* Statistiques */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={6}>
        <Card bg={cardBg} borderRadius="lg" boxShadow="md">
          <CardBody>
            <Stat>
              <StatLabel color={textColor}>Total des documents</StatLabel>
              <StatNumber fontSize="3xl">{stats.total}</StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                Documents soumis
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        
        <Card bg={cardBg} borderRadius="lg" boxShadow="md">
          <CardBody>
            <Stat>
              <StatLabel color={textColor}>Approuvés</StatLabel>
              <StatNumber fontSize="3xl" color="green.500">{stats.approved}</StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                {stats.total > 0 ? `${Math.round((stats.approved / stats.total) * 100)}% du total` : 'Aucun document'}
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        
        <Card bg={cardBg} borderRadius="lg" boxShadow="md">
          <CardBody>
            <Stat>
              <StatLabel color={textColor}>En attente</StatLabel>
              <StatNumber fontSize="3xl" color="orange.500">{stats.pending}</StatNumber>
              <StatHelpText>
                <StatArrow type="decrease" />
                {stats.pending > 0 ? 'En cours de vérification' : 'Aucun document en attente'}
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        
        <Card bg={cardBg} borderRadius="lg" boxShadow="md">
          <CardBody>
            <Stat>
              <StatLabel color={textColor}>Rejetés</StatLabel>
              <StatNumber fontSize="3xl" color="red.500">{stats.rejected}</StatNumber>
              <StatHelpText>
                <StatArrow type="decrease" />
                {stats.rejected > 0 ? 'Documents à corriger' : 'Aucun document rejeté'}
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Barre de progression */}
      <Card bg={cardBg} borderRadius="lg" boxShadow="md" mb={6}>
        <CardBody>
          <VStack align="stretch" spacing={4}>
            <HStack justify="space-between">
              <Heading size="sm" color={headingColor}>Progression de la vérification</Heading>
              <Badge colorScheme={stats.verificationProgress === 100 ? 'green' : 'yellow'}>
                {stats.verificationProgress}%
              </Badge>
            </HStack>
            <Progress 
              value={stats.verificationProgress} 
              colorScheme={stats.verificationProgress === 100 ? 'green' : 'yellow'} 
              borderRadius="full"
              size="lg"
            />
            <Text fontSize="sm" color={textColor}>
              {stats.verificationProgress === 100 
                ? 'Tous vos documents ont été vérifiés et approuvés.' 
                : stats.verificationProgress > 0 
                  ? 'Votre compte est en cours de vérification. Vous pouvez continuer à soumettre des documents.' 
                  : 'Commencez à soumettre vos documents pour vérification.'}
            </Text>
          </VStack>
        </CardBody>
      </Card>

      {/* Onglets */}
      <Tabs variant="enclosed" colorScheme="blue" index={activeTab} onChange={setActiveTab}>
        <TabList mb={4}>
          <Tab>
            <HStack>
              <Icon as={FaFileAlt} />
              <Text>Mes documents</Text>
              {stats.total > 0 && (
                <Badge colorScheme="blue" borderRadius="full" ml={2}>
                  {stats.total}
                </Badge>
              )}
            </HStack>
          </Tab>
          <Tab>
            <HStack>
              <Icon as={FaHistory} />
              <Text>Historique</Text>
              {history.length > 0 && (
                <Badge colorScheme="blue" borderRadius="full" ml={2}>
                  {history.length}
                </Badge>
              )}
            </HStack>
          </Tab>
        </TabList>

        <TabPanels>
          {/* Onglet Documents */}
          <TabPanel p={0}>
            <Card bg={cardBg} borderRadius="lg" boxShadow="md" overflow="hidden">
              <CardHeader bg={useColorModeValue('gray.50', 'gray.700')} py={4}>
                <Flex justify="space-between" align="center">
                  <Heading size="md">Mes documents</Heading>
                  <HStack spacing={4}>
                    <Input
                      placeholder="Rechercher..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      maxW="200px"
                      size="sm"
                    />
                    <Select 
                      value={filterStatus} 
                      onChange={(e) => setFilterStatus(e.target.value)}
                      maxW="150px"
                      size="sm"
                    >
                      <option value="all">Tous les statuts</option>
                      <option value="PENDING">En attente</option>
                      <option value="APPROVED">Approuvés</option>
                      <option value="REJECTED">Rejetés</option>
                    </Select>
                    <Button
                      as="label"
                      htmlFor="file-upload"
                      colorScheme="blue"
                      leftIcon={<Icon as={FaFileUpload} />}
                      cursor="pointer"
                      size="sm"
                    >
                      Ajouter
                      <input
                        id="file-upload"
                        type="file"
                        hidden
                        onChange={handleFileUpload}
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                    </Button>
                  </HStack>
                </Flex>
              </CardHeader>
              <CardBody>
                {filteredDocuments.length > 0 ? (
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Type</Th>
                        <Th>Nom du document</Th>
                        <Th>Date de soumission</Th>
                        <Th>Statut</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {filteredDocuments.map((doc) => (
                        <Tr key={doc.id} _hover={{ bg: hoverBg }}>
                          <Td>
                            <HStack>
                              {getDocumentTypeIcon(doc.type)}
                              <Text>{getDocumentTypeText(doc.type)}</Text>
                            </HStack>
                          </Td>
                          <Td>{doc.name}</Td>
                          <Td>{new Date(doc.uploadDate).toLocaleDateString()}</Td>
                          <Td>
                            <Badge colorScheme={getStatusColor(doc.status)}>
                              {getStatusText(doc.status)}
                            </Badge>
                          </Td>
                          <Td>
                            <HStack spacing={2}>
                              <Tooltip label="Voir le document">
                                <IconButton
                                  aria-label="Voir le document"
                                  icon={<Icon as={FaEye} />}
                                  size="sm"
                                  colorScheme="blue"
                                  variant="ghost"
                                  onClick={() => handleViewDocument(doc)}
                                />
                              </Tooltip>
                              <Tooltip label="Télécharger">
                                <IconButton
                                  aria-label="Télécharger"
                                  icon={<Icon as={FaDownload} />}
                                  size="sm"
                                  colorScheme="green"
                                  variant="ghost"
                                  onClick={() => window.open(doc.url, '_blank')}
                                />
                              </Tooltip>
                              <Menu>
                                <MenuButton
                                  as={IconButton}
                                  icon={<Icon as={FaEllipsisV} />}
                                  variant="ghost"
                                  size="sm"
                                />
                                <MenuList>
                                  <MenuItem icon={<Icon as={FaInfoCircle} />}>
                                    Détails
                                  </MenuItem>
                                  {doc.status === 'REJECTED' && (
                                    <MenuItem icon={<Icon as={FaFileUpload} />}>
                                      Soumettre à nouveau
                                    </MenuItem>
                                  )}
                                </MenuList>
                              </Menu>
                            </HStack>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                ) : (
                  <Center py={8}>
                    <VStack spacing={4}>
                      <Icon as={FaFileAlt} boxSize={10} color="gray.400" />
                      <Text color="gray.500">Aucun document trouvé</Text>
                      <Button
                        as="label"
                        htmlFor="file-upload-empty"
                        colorScheme="blue"
                        leftIcon={<Icon as={FaPlus} />}
                        cursor="pointer"
                      >
                        Ajouter un document
                        <input
                          id="file-upload-empty"
                          type="file"
                          hidden
                          onChange={handleFileUpload}
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                      </Button>
                    </VStack>
                  </Center>
                )}
              </CardBody>
            </Card>
          </TabPanel>

          {/* Onglet Historique */}
          <TabPanel p={0}>
            <Card bg={cardBg} borderRadius="lg" boxShadow="md" overflow="hidden">
              <CardHeader bg={useColorModeValue('gray.50', 'gray.700')} py={4}>
                <Heading size="md">Historique des vérifications</Heading>
              </CardHeader>
              <CardBody>
                {history.length > 0 ? (
                  <VStack spacing={4} align="stretch">
                    {history.map((entry) => (
                      <Card key={entry.id} variant="outline" borderColor={borderColor}>
                        <CardBody>
                          <VStack align="stretch" spacing={2}>
                            <HStack justify="space-between">
                              <HStack>
                                {entry.action === 'UPLOAD' && <Icon as={FaFileUpload} color="blue.500" />}
                                {entry.action === 'VERIFY' && <Icon as={FaCheckCircle} color="green.500" />}
                                {entry.action === 'REJECT' && <Icon as={FaTimesCircle} color="red.500" />}
                                <Text fontWeight="bold">
                                  {entry.action === 'UPLOAD' ? 'Document téléchargé' :
                                   entry.action === 'VERIFY' ? 'Document approuvé' :
                                   'Document rejeté'}
                                </Text>
                              </HStack>
                              <Badge colorScheme={getStatusColor(entry.status)}>
                                {getStatusText(entry.status)}
                              </Badge>
                            </HStack>
                            <Text fontSize="sm" color={textColor}>
                              {new Date(entry.timestamp).toLocaleString()}
                            </Text>
                            {entry.comments && (
                              <Text fontSize="sm">{entry.comments}</Text>
                            )}
                          </VStack>
                        </CardBody>
                      </Card>
                    ))}
                  </VStack>
                ) : (
                  <Center py={8}>
                    <VStack spacing={4}>
                      <Icon as={FaHistory} boxSize={10} color="gray.400" />
                      <Text color="gray.500">Aucun historique disponible</Text>
                    </VStack>
                  </Center>
                )}
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Modal de visualisation du document */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Détails du document</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedDocument && (
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <HStack>
                    {getDocumentTypeIcon(selectedDocument.type)}
                    <Heading size="md">{getDocumentTypeText(selectedDocument.type)}</Heading>
                  </HStack>
                  <Badge colorScheme={getStatusColor(selectedDocument.status)} fontSize="md" p={2}>
                    {getStatusText(selectedDocument.status)}
                  </Badge>
                </HStack>
                
                <Divider />
                
                <SimpleGrid columns={2} spacing={4}>
                  <FormControl>
                    <FormLabel>Nom du document</FormLabel>
                    <Input value={selectedDocument.name} isReadOnly />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Date de soumission</FormLabel>
                    <Input value={new Date(selectedDocument.uploadDate).toLocaleString()} isReadOnly />
                  </FormControl>
                </SimpleGrid>
                
                {selectedDocument.comments && (
                  <FormControl>
                    <FormLabel>Commentaires</FormLabel>
                    <Textarea value={selectedDocument.comments} isReadOnly />
                  </FormControl>
                )}
                
                <HStack spacing={4} justify="flex-end" mt={4}>
                  <Button
                    colorScheme="blue"
                    leftIcon={<Icon as={FaDownload} />}
                    onClick={() => window.open(selectedDocument.url, '_blank')}
                  >
                    Télécharger
                  </Button>
                  <Button
                    colorScheme="blue"
                    leftIcon={<Icon as={FaEye} />}
                    onClick={() => window.open(selectedDocument.url, '_blank')}
                  >
                    Voir le document
                  </Button>
                </HStack>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}; 