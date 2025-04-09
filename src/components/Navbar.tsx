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
  Avatar,
  Tooltip,
  Text,
  useToast,
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { RootState, AppDispatch } from '../store';
import { UserRole } from '../types';
import { FaHome, FaTruck, FaCalendarAlt, FaUser, FaChartLine } from 'react-icons/fa';

const Links = [
  { name: 'Accueil', path: '/' },
  { name: 'Équipements', path: '/equipments' },
  { name: 'À propos', path: '/about' },
];

const NavLink = ({ children, to }: { children: React.ReactNode; to: string }) => (
  <RouterLink to={to}>
    <Box
      px={2}
      py={1}
      rounded={'md'}
      _hover={{
        textDecoration: 'none',
        bg: useColorModeValue('gray.200', 'gray.700'),
      }}
    >
      {children}
    </Box>
  </RouterLink>
);

const Navbar = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const location = useLocation();
  const toast = useToast();

  const handleLogout = async () => {
    try {
      await dispatch(logout());
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la déconnexion",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const navButtons = [
    { name: 'Tableau de bord', icon: FaChartLine, path: '/dashboard', roles: [UserRole.ADMIN, UserRole.PROFESSIONAL, UserRole.BUSINESS] },
    { name: 'Engins', icon: FaTruck, path: '/equipments', roles: [UserRole.ADMIN, UserRole.PROFESSIONAL, UserRole.BUSINESS] },
    { name: 'Locations', icon: FaCalendarAlt, path: '/rentals', roles: [UserRole.ADMIN, UserRole.PROFESSIONAL, UserRole.BUSINESS] },
    { name: 'Calendrier', icon: FaCalendarAlt, path: '/calendar', roles: [UserRole.ADMIN, UserRole.PROFESSIONAL, UserRole.BUSINESS] },
  ];

  return (
    <Box bg={useColorModeValue('gray.100', 'gray.900')} px={4} position="sticky" top={0} zIndex={1000} shadow="sm">
      <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
        <IconButton
          size={'md'}
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
          aria-label={'Open Menu'}
          display={{ md: 'none' }}
          onClick={isOpen ? onClose : onOpen}
        />
        <HStack spacing={8} alignItems={'center'}>
          <Box fontWeight="bold" fontSize="xl" color={useColorModeValue('blue.600', 'blue.300')}>
            Location Voiture
          </Box>
          <HStack as={'nav'} spacing={4} display={{ base: 'none', md: 'flex' }}>
            {Links.map((link) => (
              <NavLink key={link.path} to={link.path}>
                {link.name}
              </NavLink>
            ))}
          </HStack>
        </HStack>
        <Flex alignItems={'center'} gap={4}>
          {user && (user.role === UserRole.ADMIN || user.role === UserRole.PROFESSIONAL || user.role === UserRole.BUSINESS) && (
            <HStack spacing={2} display={{ base: 'none', md: 'flex' }}>
              {navButtons.map((button) => (
                <Tooltip key={button.path} label={button.name} placement="bottom">
                  <Button
                    as={RouterLink}
                    to={button.path}
                    size="sm"
                    leftIcon={<button.icon />}
                    variant={isActive(button.path) ? 'solid' : 'ghost'}
                    colorScheme={isActive(button.path) ? 'blue' : 'gray'}
                    _hover={{
                      transform: 'translateY(-2px)',
                      boxShadow: 'md',
                    }}
                    transition="all 0.2s"
                  >
                    {button.name}
                  </Button>
                </Tooltip>
              ))}
            </HStack>
          )}
          {user ? (
            <Menu>
              <MenuButton
                as={Button}
                rounded={'full'}
                variant={'outline'}
                cursor={'pointer'}
                minW={0}
                display="flex"
                alignItems="center"
                gap={2}
                px={4}
                py={2}
                _hover={{
                  bg: useColorModeValue('gray.100', 'gray.700'),
                  transform: 'translateY(-1px)',
                  boxShadow: 'sm',
                }}
                transition="all 0.2s"
              >
                <Avatar 
                  size={'sm'} 
                  name={user.email}
                  bg={useColorModeValue('blue.500', 'blue.200')}
                  color={useColorModeValue('white', 'gray.800')}
                />
                <Box display={{ base: 'none', md: 'block' }}>
                  <Text fontWeight="medium" fontSize="sm">
                    {user.email}
                  </Text>
                  <Text fontSize="xs" color={useColorModeValue('gray.600', 'gray.400')}>
                    {user.role}
                  </Text>
                </Box>
              </MenuButton>
              <MenuList>
                <MenuItem as={RouterLink} to="/profile" icon={<FaUser />}>Profil</MenuItem>
                {(user.role === UserRole.ADMIN || user.role === UserRole.PROFESSIONAL || user.role === UserRole.BUSINESS) && (
                  <MenuItem as={RouterLink} to="/dashboard" icon={<FaChartLine />}>Tableau de bord</MenuItem>
                )}
                <MenuItem onClick={handleLogout}>Déconnexion</MenuItem>
              </MenuList>
            </Menu>
          ) : (
            <Stack
              flex={{ base: 1, md: 0 }}
              justify={'flex-end'}
              direction={'row'}
              spacing={6}
            >
              <Button
                as={RouterLink}
                to="/login"
                fontSize={'sm'}
                fontWeight={400}
                variant={'link'}
              >
                Connexion
              </Button>
              <Button
                as={RouterLink}
                to="/register"
                display={{ base: 'none', md: 'inline-flex' }}
                fontSize={'sm'}
                fontWeight={600}
                color={'white'}
                bg={'blue.400'}
                _hover={{
                  bg: 'blue.300',
                }}
              >
                Inscription
              </Button>
            </Stack>
          )}
        </Flex>
      </Flex>

      {isOpen ? (
        <Box pb={4} display={{ md: 'none' }}>
          <Stack as={'nav'} spacing={4}>
            {Links.map((link) => (
              <NavLink key={link.path} to={link.path}>
                {link.name}
              </NavLink>
            ))}
          </Stack>
        </Box>
      ) : null}
    </Box>
  );
};

export default Navbar; 