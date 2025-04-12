import { useState, useEffect } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Box,
  Flex,
  HStack,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  useColorModeValue,
  Stack,
  Text,
  Avatar,
  useToast,
  Badge,
  Tooltip,
  Icon,
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../store/slices/authSlice';
import authService from '../services/authService';
import { UserRole } from '../types';
import { FaHome, FaTruck, FaCalendarAlt, FaUser, FaChartLine } from 'react-icons/fa';

interface NavLinkProps {
  children: React.ReactNode;
  to: string;
}

const NavLink = ({ children, to }: NavLinkProps) => (
  <RouterLink
    to={to}
    style={{
      padding: '0.5rem 1rem',
      borderRadius: '0.375rem',
      textDecoration: 'none',
      color: 'inherit',
    }}
  >
    {children}
  </RouterLink>
);

const Navbar = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const location = useLocation();
  const toast = useToast();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await authService.logoutUser();
      dispatch(logout());
      toast({
        title: 'Déconnexion réussie',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Erreur lors de la déconnexion',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const getNavLinks = () => {
    const links = [
      { name: 'Accueil', path: '/' },
      { name: 'Équipements', path: '/equipment' },
    ];

    if (isAuthenticated) {
      if (user?.role === UserRole.ADMIN) {
        links.push({ name: 'Tableau de bord', path: '/dashboard' });
      } else {
        links.push(
          { name: 'Mon Profil', path: '/profile' },
          { name: 'Mes Équipements', path: '/my-equipment' }
        );
      }
    }

    return links;
  };

  const navLinks = getNavLinks();

  return (
    <Box bg={useColorModeValue('white', 'gray.900')} px={4} boxShadow="sm">
      <Flex h={16} alignItems="center" justifyContent="space-between">
        <IconButton
          size="md"
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
          aria-label="Open Menu"
          display={{ base: 'flex', md: 'none' }}
          onClick={isOpen ? onClose : onOpen}
        />
        <HStack spacing={8} alignItems="center">
          <Box fontWeight="bold" fontSize="xl">
            Location Voiture
          </Box>
          <HStack as="nav" spacing={4} display={{ base: 'none', md: 'flex' }}>
            {navLinks.map((link) => (
              <NavLink key={link.path} to={link.path}>
                <Text
                  color={isActive(link.path) ? 'blue.500' : 'inherit'}
                  fontWeight={isActive(link.path) ? 'bold' : 'normal'}
                >
                  {link.name}
                </Text>
              </NavLink>
            ))}
          </HStack>
        </HStack>
        <Flex alignItems="center">
          {isAuthenticated ? (
            <Menu>
              <MenuButton
                as={Button}
                rounded="full"
                variant="link"
                cursor="pointer"
                minW={0}
              >
                <Avatar
                  size="sm"
                  name={user?.firstName ? `${user.firstName} ${user.lastName}` : undefined}
                />
              </MenuButton>
              <MenuList>
                <MenuItem as={RouterLink} to="/profile">
                  Mon Profil
                </MenuItem>
                {user?.role === UserRole.ADMIN && (
                  <MenuItem as={RouterLink} to="/dashboard">
                    Tableau de bord
                  </MenuItem>
                )}
                {(user?.role === UserRole.PROFESSIONAL || user?.role === UserRole.BUSINESS) && (
                  <MenuItem as={RouterLink} to="/professional-dashboard">
                    Tableau de bord
                  </MenuItem>
                )}
                <MenuItem onClick={handleLogout} disabled={isLoading}>
                  {isLoading ? 'Déconnexion...' : 'Déconnexion'}
                </MenuItem>
              </MenuList>
            </Menu>
          ) : (
            <HStack spacing={4}>
              <Button
                as={RouterLink}
                to="/login"
                variant="ghost"
                colorScheme="blue"
              >
                Connexion
              </Button>
              <Button
                as={RouterLink}
                to="/register"
                colorScheme="blue"
              >
                Inscription
              </Button>
            </HStack>
          )}
        </Flex>
      </Flex>

      {/* Mobile menu */}
      {isOpen && (
        <Box pb={4} display={{ md: 'none' }}>
          <Stack as="nav" spacing={4}>
            {navLinks.map((link) => (
              <NavLink key={link.path} to={link.path}>
                <Text
                  color={isActive(link.path) ? 'blue.500' : 'inherit'}
                  fontWeight={isActive(link.path) ? 'bold' : 'normal'}
                >
                  {link.name}
                </Text>
              </NavLink>
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default Navbar; 