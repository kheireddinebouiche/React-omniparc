import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Stack,
  Flex,
  Image,
  SimpleGrid,
  Icon,
  Button,
  VStack,
  HStack,
  Badge,
  useColorModeValue,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from '@chakra-ui/react';
import { FaTruck, FaCalendarCheck, FaUserShield, FaHandshake, FaClock, FaChartLine } from 'react-icons/fa';
import { Link as RouterLink } from 'react-router-dom';

const Feature = ({ title, text, icon }: { title: string; text: string; icon: React.ElementType }) => {
  return (
    <Stack
      align={'center'}
      textAlign={'center'}
      p={6}
      rounded={'xl'}
      bg={useColorModeValue('white', 'gray.700')}
      shadow={'lg'}
      _hover={{
        transform: 'translateY(-5px)',
        shadow: '2xl',
      }}
      transition="all 0.3s"
    >
      <Flex
        w={16}
        h={16}
        align={'center'}
        justify={'center'}
        color={'white'}
        rounded={'full'}
        bg={useColorModeValue('blue.500', 'blue.300')}
        mb={4}
      >
        <Icon as={icon} w={8} h={8} />
      </Flex>
      <Text fontWeight={600} fontSize={'xl'}>
        {title}
      </Text>
      <Text color={useColorModeValue('gray.600', 'gray.300')}>
        {text}
      </Text>
    </Stack>
  );
};

const StatCard = ({ label, number, helpText }: { label: string; number: string; helpText: string }) => {
  return (
    <Stat
      px={4}
      py={6}
      bg={useColorModeValue('white', 'gray.700')}
      shadow={'lg'}
      rounded={'lg'}
      _hover={{
        transform: 'translateY(-5px)',
        shadow: '2xl',
      }}
      transition="all 0.3s"
    >
      <StatLabel fontSize={'lg'} fontWeight={'medium'}>
        {label}
      </StatLabel>
      <StatNumber fontSize={'3xl'} fontWeight={'bold'} color={useColorModeValue('blue.500', 'blue.300')}>
        {number}
      </StatNumber>
      <StatHelpText>{helpText}</StatHelpText>
    </Stat>
  );
};

const Home = () => {
  return (
    <Box>
      {/* Hero Section */}
      <Box
        bg={useColorModeValue('blue.50', 'gray.900')}
        pt={20}
        pb={16}
      >
        <Container maxW={'7xl'}>
          <Stack
            align={'center'}
            spacing={{ base: 8, md: 10 }}
            direction={{ base: 'column', md: 'row' }}
          >
            <Stack flex={1} spacing={6}>
              <Heading
                lineHeight={1.1}
                fontWeight={600}
                fontSize={{ base: '3xl', sm: '4xl', lg: '6xl' }}
              >
                <Text as={'span'}>
                  Location d'engins
                </Text>
                <br />
                <Text as={'span'} color={'blue.400'}>
                  professionnels
                </Text>
              </Heading>
              <Text color={useColorModeValue('gray.600', 'gray.300')} fontSize={'xl'}>
                Trouvez l'équipement parfait pour votre projet. Notre plateforme vous connecte avec les meilleurs fournisseurs d'engins professionnels.
              </Text>
              <Stack spacing={4} direction={{ base: 'column', sm: 'row' }}>
                <Button
                  as={RouterLink}
                  to="/equipments"
                  rounded={'full'}
                  size={'lg'}
                  fontWeight={'bold'}
                  px={6}
                  colorScheme={'blue'}
                  bg={'blue.400'}
                  _hover={{ bg: 'blue.500' }}
                >
                  Voir les engins
                </Button>
                <Button
                  as={RouterLink}
                  to="/register"
                  rounded={'full'}
                  size={'lg'}
                  fontWeight={'bold'}
                  px={6}
                >
                  Devenir partenaire
                </Button>
              </Stack>
            </Stack>
            <Flex flex={1}>
              <Image
                alt={'Construction Equipment'}
                fit={'cover'}
                align={'center'}
                w={'100%'}
                h={'100%'}
                src={'https://images.unsplash.com/photo-1581092160562-40aa08e78837?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'}
                rounded={'xl'}
              />
            </Flex>
          </Stack>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxW={'7xl'} py={16}>
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={8}>
          <StatCard
            label="Engins disponibles"
            number="500+"
            helpText="Équipements variés"
          />
          <StatCard
            label="Utilisateurs actifs"
            number="2000+"
            helpText="Professionnels satisfaits"
          />
          <StatCard
            label="Locations réussies"
            number="10000+"
            helpText="Depuis notre création"
          />
          <StatCard
            label="Villes couvertes"
            number="50+"
            helpText="En France"
          />
        </SimpleGrid>
      </Container>

      {/* Features Section */}
      <Box bg={useColorModeValue('gray.50', 'gray.800')} py={16}>
        <Container maxW={'7xl'}>
          <VStack spacing={4} mb={12} textAlign="center">
            <Heading fontSize={'4xl'}>Pourquoi nous choisir ?</Heading>
            <Text color={useColorModeValue('gray.600', 'gray.300')} maxW={'3xl'}>
              Notre plateforme offre une solution complète pour la location d'engins professionnels,
              avec des fonctionnalités conçues pour répondre à vos besoins.
            </Text>
          </VStack>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
            <Feature
              icon={FaTruck}
              title={'Large choix d\'engins'}
              text={'Accédez à une vaste sélection d\'équipements professionnels de qualité.'}
            />
            <Feature
              icon={FaCalendarCheck}
              title={'Réservation simple'}
              text={'Processus de réservation rapide et intuitif avec confirmation instantanée.'}
            />
            <Feature
              icon={FaUserShield}
              title={'Sécurité garantie'}
              text={'Transactions sécurisées et assurance incluse pour chaque location.'}
            />
            <Feature
              icon={FaHandshake}
              title={'Service fiable'}
              text={'Support client disponible 7j/7 pour vous accompagner.'}
            />
            <Feature
              icon={FaClock}
              title={'Disponibilité 24/7'}
              text={'Réservez vos engins à tout moment selon vos besoins.'}
            />
            <Feature
              icon={FaChartLine}
              title={'Gestion optimisée'}
              text={'Suivez vos locations et gérez votre flotte efficacement.'}
            />
          </SimpleGrid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box py={16}>
        <Container maxW={'7xl'}>
          <Stack
            bg={useColorModeValue('blue.50', 'blue.900')}
            rounded={'xl'}
            p={8}
            spacing={6}
            align={'center'}
          >
            <Heading fontSize={'3xl'}>Prêt à commencer ?</Heading>
            <Text fontSize={'xl'} color={useColorModeValue('gray.600', 'gray.300')}>
              Rejoignez notre communauté de professionnels et trouvez l'équipement dont vous avez besoin.
            </Text>
            <Stack spacing={4} direction={{ base: 'column', sm: 'row' }}>
              <Button
                as={RouterLink}
                to="/register"
                rounded={'full'}
                size={'lg'}
                fontWeight={'bold'}
                px={6}
                colorScheme={'blue'}
                bg={'blue.400'}
                _hover={{ bg: 'blue.500' }}
              >
                S'inscrire maintenant
              </Button>
              <Button
                as={RouterLink}
                to="/about"
                rounded={'full'}
                size={'lg'}
                fontWeight={'bold'}
                px={6}
              >
                En savoir plus
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;