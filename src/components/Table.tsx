import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Box,
  Text,
  HStack,
  IconButton,
  Tooltip,
  useColorModeValue,
  Badge,
  Select,
  Input,
  Flex,
  Button,
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon, ViewIcon } from '@chakra-ui/icons';
import { ReactNode } from 'react';

interface Column<T> {
  key: keyof T;
  header: string;
  render?: (item: T) => ReactNode;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
  isLoading?: boolean;
  isAdmin?: boolean;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  filterOptions?: { value: string; label: string }[];
  onFilter?: (value: string) => void;
}

const CustomTable = <T extends { id: string }>({
  data,
  columns,
  onEdit,
  onDelete,
  onView,
  isLoading = false,
  isAdmin = false,
  searchPlaceholder = 'Rechercher...',
  onSearch,
  filterOptions,
  onFilter,
}: TableProps<T>) => {
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      bg={bgColor}
      borderColor={borderColor}
    >
      {(onSearch || filterOptions) && (
        <Flex p={4} gap={4}>
          {onSearch && (
            <Input
              placeholder={searchPlaceholder}
              maxW="300px"
              onChange={(e) => onSearch(e.target.value)}
            />
          )}
          {filterOptions && onFilter && (
            <Select
              placeholder="Filtrer par..."
              maxW="200px"
              onChange={(e) => onFilter(e.target.value)}
            >
              {filterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          )}
        </Flex>
      )}

      <TableContainer>
        <Table variant="simple">
          <Thead>
            <Tr>
              {columns.map((column) => (
                <Th key={String(column.key)}>{column.header}</Th>
              ))}
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {data.map((item) => (
              <Tr key={item.id}>
                {columns.map((column) => (
                  <Td key={String(column.key)}>
                    {column.render
                      ? column.render(item)
                      : String(item[column.key])}
                  </Td>
                ))}
                <Td>
                  <HStack spacing={2}>
                    {onView && (
                      <Tooltip label="Voir les détails">
                        <IconButton
                          aria-label="Voir les détails"
                          icon={<ViewIcon />}
                          size="sm"
                          colorScheme="blue"
                          variant="ghost"
                          onClick={() => onView(item)}
                        />
                      </Tooltip>
                    )}
                    {isAdmin && onEdit && (
                      <Tooltip label="Modifier">
                        <IconButton
                          aria-label="Modifier"
                          icon={<EditIcon />}
                          size="sm"
                          colorScheme="green"
                          variant="ghost"
                          onClick={() => onEdit(item)}
                        />
                      </Tooltip>
                    )}
                    {isAdmin && onDelete && (
                      <Tooltip label="Supprimer">
                        <IconButton
                          aria-label="Supprimer"
                          icon={<DeleteIcon />}
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                          onClick={() => onDelete(item)}
                        />
                      </Tooltip>
                    )}
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default CustomTable; 