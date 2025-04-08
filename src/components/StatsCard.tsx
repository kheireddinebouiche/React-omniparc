import {
  Box,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react';
import { IconType } from '@chakra-ui/icon';

interface StatsCardProps {
  title: string;
  value: number | string;
  change?: number;
  icon?: IconType;
  format?: 'number' | 'currency' | 'percentage';
}

const StatsCard = ({
  title,
  value,
  change,
  icon,
  format = 'number',
}: StatsCardProps) => {
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const formatValue = (val: number | string) => {
    if (typeof val === 'string') return val;

    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'EUR',
        }).format(val);
      case 'percentage':
        return `${val}%`;
      default:
        return new Intl.NumberFormat('fr-FR').format(val);
    }
  };

  return (
    <Box
      p={5}
      shadow="md"
      borderWidth="1px"
      borderRadius="lg"
      bg={bgColor}
      borderColor={borderColor}
    >
      <Stat>
        <StatLabel fontSize="sm" color="gray.500">
          {title}
        </StatLabel>
        <StatNumber fontSize="2xl" fontWeight="bold">
          {icon && <Icon as={icon} mr={2} />}
          {formatValue(value)}
        </StatNumber>
        {change !== undefined && (
          <StatHelpText>
            <StatArrow
              type={change >= 0 ? 'increase' : 'decrease'}
              color={change >= 0 ? 'green.500' : 'red.500'}
            />
            {Math.abs(change)}% par rapport au mois dernier
          </StatHelpText>
        )}
      </Stat>
    </Box>
  );
};

export default StatsCard; 