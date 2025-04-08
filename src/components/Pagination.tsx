import {
  HStack,
  Button,
  IconButton,
  Text,
  Select,
  Flex,
  useColorModeValue,
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  onPageSizeChange: (pageSize: number) => void;
  totalItems: number;
}

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  onPageSizeChange,
  totalItems,
}: PaginationProps) => {
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const pageSizeOptions = [10, 20, 50, 100];

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <Flex
      justify="space-between"
      align="center"
      p={4}
      borderTopWidth="1px"
      borderColor={borderColor}
      bg={bgColor}
    >
      <HStack spacing={2}>
        <Text fontSize="sm">
          Affichage de {startItem} à {endItem} sur {totalItems} éléments
        </Text>
        <Select
          size="sm"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          width="auto"
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size} par page
            </option>
          ))}
        </Select>
      </HStack>

      <HStack spacing={2}>
        <IconButton
          aria-label="Page précédente"
          icon={<ChevronLeftIcon />}
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          isDisabled={currentPage === 1}
        />
        <Text fontSize="sm">
          Page {currentPage} sur {totalPages}
        </Text>
        <IconButton
          aria-label="Page suivante"
          icon={<ChevronRightIcon />}
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          isDisabled={currentPage === totalPages}
        />
      </HStack>
    </Flex>
  );
};

export default Pagination; 