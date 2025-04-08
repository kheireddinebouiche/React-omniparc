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
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';
import { Link as RouterLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { RootState, AppDispatch } from '../store';
import { UserRole } from '../types';

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

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <Box bg={useColorModeValue('gray.100', 'gray.900')} px={4}>
      <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
        <IconButton
          size={'md'}
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
          aria-label={'Open Menu'}
          display={{ md: 'none' }}
          onClick={isOpen ? onClose : onOpen}
        />
        <HStack spacing={8} alignItems={'center'}>
          <Box fontWeight="bold">Location Voiture</Box>
          <HStack as={'nav'} spacing={4} display={{ base: 'none', md: 'flex' }}>
            {Links.map((link) => (
              <NavLink key={link.path} to={link.path}>
                {link.name}
              </NavLink>
            ))}
          </HStack>
        </HStack>
        <Flex alignItems={'center'}>
          {user ? (
            <Menu>
              <MenuButton
                as={Button}
                rounded={'full'}
                variant={'link'}
                cursor={'pointer'}
                minW={0}
              >
                <Avatar size={'sm'} />
              </MenuButton>
              <MenuList>
                <MenuItem as={RouterLink} to="/profile">Profil</MenuItem>
                {user.role === UserRole.ADMIN && (
                  <MenuItem as={RouterLink} to="/admin">Dashboard</MenuItem>
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