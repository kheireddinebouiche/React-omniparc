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
} from '@chakra-ui/react';

interface Equipment {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  isAvailable: boolean;
  ownerId: string;
  specifications?: Record<string, string>;
}

interface EquipmentCardProps {
  equipment: Equipment;
  onView: () => void;
  isAdmin?: boolean;
}

const EquipmentCard: React.FC<EquipmentCardProps> = ({ equipment, onView, isAdmin }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <Box
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      overflow="hidden"
      transition="all 0.3s"
      _hover={{
        transform: 'translateY(-8px)',
        shadow: 'xl',
      }}
    >
      <Box position="relative" height="200px">
        <Image
          src={equipment.image || 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'}
          alt={equipment.name}
          objectFit="cover"
          width="100%"
          height="100%"
        />
        <Badge
          position="absolute"
          top={4}
          right={4}
          colorScheme={equipment.isAvailable ? 'green' : 'red'}
          backdropFilter="blur(4px)"
          bg="rgba(255, 255, 255, 0.8)"
        >
          {equipment.isAvailable ? 'Disponible' : 'Non disponible'}
        </Badge>
      </Box>

      <VStack align="stretch" p={4} spacing={3}>
        <Text fontSize="xl" fontWeight="bold" noOfLines={1}>
          {equipment.name}
        </Text>

        <Text color={textColor} noOfLines={2}>
          {equipment.description}
        </Text>

        <HStack>
          <Text fontSize="2xl" fontWeight="bold" color="blue.500">
            {equipment.price}€
          </Text>
          <Text color={textColor}>/jour</Text>
        </HStack>

        <HStack wrap="wrap" spacing={2}>
          {equipment.specifications &&
            Object.entries(equipment.specifications)
              .slice(0, 3)
              .map(([key, value]) => (
                <Badge key={key} variant="outline" fontSize="xs">
                  {key}: {value as string}
                </Badge>
              ))}
        </HStack>

        <Button
          colorScheme="blue"
          onClick={onView}
          isDisabled={!equipment.isAvailable || (isAdmin !== undefined && equipment.ownerId === isAdmin)}
          size="lg"
          width="100%"
        >
          {isAdmin !== undefined && equipment.ownerId === isAdmin ? 'Votre engin' : 'Voir les détails'}
        </Button>
      </VStack>
    </Box>
  );
};

export default EquipmentCard; 