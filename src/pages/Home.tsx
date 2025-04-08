import { Box, Heading, Text, Button, SimpleGrid, Icon, VStack, useColorModeValue } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { FaTools, FaShieldAlt, FaTachometerAlt, FaHeadset } from 'react-icons/fa';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const isAuthenticated = !!user;
  
  const bgColor = useColorModeValue('primary.500', 'primary.700');
  const textColor = useColorModeValue('white', 'gray.100');
  const cardBg = useColorModeValue('white', 'gray.800');
  const cardBorder = useColorModeValue('gray.200', 'gray.700');

  const features = [
    {
      icon: FaTools,
      title: 'Large choix d\'engins',
      description: 'Des milliers d\'engins de chantier disponibles pour tous vos projets'
    },
    {
      icon: FaShieldAlt,
      title: 'Location sécurisée',
      description: 'Paiements sécurisés et garanties pour une location en toute confiance'
    },
    {
      icon: FaTachometerAlt,
      title: 'Réservation rapide',
      description: 'Réservez vos engins en quelques clics et recevez une confirmation instantanée'
    },
    {
      icon: FaHeadset,
      title: 'Support 24/7',
      description: 'Une équipe à votre écoute pour vous accompagner dans vos locations'
    }
  ];

  return (
    <Box width="100%" overflow="hidden">
      {/* Hero Section */}
      <Box
        bg={bgColor}
        color={textColor}
        py={16}
        position="relative"
        width="100%"
        mx={0}
        px={{ base: 4, md: 8 }}
      >
        <Box 
          maxW="lg" 
          mx="auto"
          display="flex" 
          flexDirection={{ base: 'column', md: 'row' }} 
          gap={8} 
          alignItems="center" 
        >
          <Box flex={1}>
            <Heading as="h1" size="2xl" mb={4}>
              Location d'Engins de Chantier
            </Heading>
            <Text fontSize="xl" mb={6}>
              Trouvez l'équipement parfait pour vos projets de construction
            </Text>
            <Button
              colorScheme="secondary"
              size="lg"
              onClick={() => navigate('/equipment')}
              mt={4}
            >
              Découvrir les engins
            </Button>
          </Box>
          <Box flex={1}>
            <Box
              as="img"
              src="/images/hero-image.jpg"
              alt="Engin de chantier"
              width="100%"
              height="auto"
              borderRadius="lg"
              boxShadow="xl"
            />
          </Box>
        </Box>
      </Box>

      {/* Features Section */}
      <Box 
        py={16}
        px={{ base: 4, md: 8 }}
        width="100%"
      >
        <Box maxW="lg" mx="auto">
          <Heading as="h2" size="xl" textAlign="center" mb={12}>
            Pourquoi nous choisir ?
          </Heading>
          
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
            {features.map((feature, index) => (
              <Box 
                key={index}
                p={6}
                bg={cardBg}
                borderRadius="lg"
                borderWidth="1px"
                borderColor={cardBorder}
                boxShadow="md"
                transition="all 0.3s"
                _hover={{
                  transform: 'translateY(-4px)',
                  boxShadow: 'lg',
                }}
              >
                <VStack align="start" spacing={4}>
                  <Icon as={feature.icon} boxSize={10} color="primary.500" />
                  <Heading as="h3" size="md">
                    {feature.title}
                  </Heading>
                  <Text color="gray.600">
                    {feature.description}
                  </Text>
                </VStack>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      </Box>
    </Box>
  );
};

export default Home; 