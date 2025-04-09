import React from 'react';
import {
  Box,
  Image,
  Text,
  Button,
  Badge,
  VStack,
  HStack,
  useColorModeValue,
  Icon,
  Tooltip,
  Flex,
  Spacer,
  Heading,
  Divider,
  useToken,
} from '@chakra-ui/react';
import { User } from '../types';
import { FaTag, FaEuroSign, FaCheckCircle, FaTimesCircle, FaInfoCircle, FaTruck, FaCog, FaMapMarkerAlt } from 'react-icons/fa';

interface Equipment {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  isAvailable: boolean;
  ownerId: string;
  specifications?: Record<string, string>;
  location?: string;
}

interface EquipmentCardProps {
  equipment: Equipment;
  onView: () => void;
  isAdmin?: string;
  user?: User | null;
}

const EquipmentCard: React.FC<EquipmentCardProps> = ({ equipment, onView, isAdmin, user }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const priceColor = useColorModeValue('blue.600', 'blue.300');
  const cardShadow = useColorModeValue('lg', 'dark-lg');
  const [blue500] = useToken('colors', ['blue.500']);
  const [purple500] = useToken('colors', ['purple.500']);
  const [pink500] = useToken('colors', ['pink.500']);

  // Vérifier si l'utilisateur est le propriétaire de l'équipement
  const isOwner = user?.id === equipment.ownerId;
  // Vérifier si l'utilisateur est admin
  const isUserAdmin = user?.role === 'ADMIN';

  return (
    <Box
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="2xl"
      overflow="hidden"
      transition="all 0.3s ease"
      boxShadow={cardShadow}
      _hover={{
        transform: 'translateY(-8px)',
        boxShadow: 'xl',
      }}
      position="relative"
      height="100%"
      display="flex"
      flexDirection="column"
    >
      <Box position="relative" height="180px">
        <Image
          src={equipment.image || 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'}
          alt={equipment.name}
          objectFit="cover"
          width="100%"
          height="100%"
        />
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgGradient="linear(to-b, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.1) 100%)"
        />
        <Badge
          position="absolute"
          top={2}
          right={2}
          colorScheme={equipment.isAvailable ? 'green' : 'red'}
          backdropFilter="blur(4px)"
          bg={equipment.isAvailable ? "rgba(72, 187, 120, 0.8)" : "rgba(245, 101, 101, 0.8)"}
          color="white"
          px={2}
          py={0.5}
          borderRadius="full"
          fontSize="xs"
          fontWeight="bold"
          display="flex"
          alignItems="center"
          gap={1}
          boxShadow="md"
        >
          {equipment.isAvailable ? (
            <>
              <Icon as={FaCheckCircle} />
              <Text>Disponible</Text>
            </>
          ) : (
            <>
              <Icon as={FaTimesCircle} />
              <Text>Non disponible</Text>
            </>
          )}
        </Badge>
      </Box>

      <VStack align="stretch" p={3} spacing={2} flex="1" display="flex" flexDirection="column">
        <Heading as="h3" size="sm" noOfLines={1} fontWeight="bold" color={useColorModeValue('gray.800', 'white')}>
          {equipment.name}
        </Heading>

        <Text color={textColor} noOfLines={2} fontSize="xs" lineHeight="tall">
          {equipment.description}
        </Text>

        <Divider borderColor={useColorModeValue('gray.200', 'gray.600')} my={1} />

        <Flex alignItems="center" mt={1}>
          <Box 
            display="flex" 
            alignItems="center" 
            bg={useColorModeValue('blue.50', 'blue.900')} 
            px={2} 
            py={1} 
            borderRadius="lg"
            boxShadow="sm"
          >
            <Icon as={FaEuroSign} color={priceColor} mr={1} />
            <Text fontSize="md" fontWeight="bold" color={priceColor}>
              {equipment.price}
            </Text>
            <Text color={textColor} ml={1} fontSize="xs">/jour</Text>
          </Box>
          <Spacer />
          <Tooltip 
            label={isOwner ? "C'est votre équipement" : "Voir les détails"} 
            placement="top"
            hasArrow
            bg={useColorModeValue('gray.800', 'white')}
            color={useColorModeValue('white', 'gray.800')}
          >
            <Button
              colorScheme="blue"
              onClick={onView}
              isDisabled={!equipment.isAvailable || isOwner}
              size="sm"
              borderRadius="full"
              leftIcon={<FaInfoCircle />}
              bgGradient="linear(to-r, blue.400, blue.600)"
              _hover={{
                bgGradient: "linear(to-r, blue.500, blue.700)",
                transform: "scale(1.05)",
              }}
              _active={{
                bgGradient: "linear(to-r, blue.600, blue.800)",
              }}
              boxShadow="md"
              px={2}
              py={1}
              fontSize="xs"
            >
              {isOwner ? 'Votre engin' : 'Voir les détails'}
            </Button>
          </Tooltip>
        </Flex>

        {equipment.specifications && Object.keys(equipment.specifications).length > 0 && (
          <Box mt="auto" pt={1}>
            <Text fontSize="xs" fontWeight="medium" color={textColor} mb={1}>
              Spécifications principales
            </Text>
            <HStack wrap="wrap" spacing={1}>
              {Object.entries(equipment.specifications)
                .slice(0, 3)
                .map(([key, value], index) => {
                  const colors = [blue500, purple500, pink500];
                  return (
                    <Badge 
                      key={key} 
                      bg={useColorModeValue(`${colors[index % 3]}15`, `${colors[index % 3]}30`)}
                      color={colors[index % 3]}
                      fontSize="xs"
                      fontWeight="medium"
                      borderRadius="md"
                      px={1.5}
                      py={0.5}
                      display="flex"
                      alignItems="center"
                      gap={0.5}
                    >
                      <Icon as={key.includes('poids') ? FaTruck : key.includes('puissance') ? FaCog : FaTag} size="8px" />
                      <Text fontSize="xs">{key}: {value as string}</Text>
                    </Badge>
                  );
                })}
              {Object.keys(equipment.specifications).length > 3 && (
                <Badge 
                  variant="subtle" 
                  fontSize="xs"
                  colorScheme="gray"
                  borderRadius="md"
                  px={1.5}
                  py={0.5}
                >
                  +{Object.keys(equipment.specifications).length - 3} autres
                </Badge>
              )}
            </HStack>
          </Box>
        )}

        <Text fontSize="xs" color="gray.600" noOfLines={2}>
          {equipment.description}
        </Text>
        <HStack spacing={2} mt={2}>
          <Icon as={FaMapMarkerAlt} color="blue.500" />
          <Text fontSize="xs" color="gray.600">
            {equipment.location || 'Localisation non spécifiée'}
          </Text>
        </HStack>
      </VStack>
    </Box>
  );
};

export default EquipmentCard; 