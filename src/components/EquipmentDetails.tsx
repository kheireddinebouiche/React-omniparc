import React from 'react';
import { Text, HStack, Icon } from '@chakra-ui/react';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { Equipment } from '../types';

interface EquipmentDetailsProps {
  equipment: Equipment;
}

const EquipmentDetails: React.FC<EquipmentDetailsProps> = ({ equipment }) => {
  return (
    <div>
      <Text fontSize="lg" color="gray.600" mb={4}>
        {equipment.description}
      </Text>
      <HStack spacing={2} mb={4}>
        <Icon as={FaMapMarkerAlt} color="blue.500" />
        <Text fontSize="md" color="gray.600">
          {equipment.location || 'Localisation non spécifiée'}
        </Text>
      </HStack>
    </div>
  );
};

export default EquipmentDetails; 