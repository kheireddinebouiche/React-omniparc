import {
  Box,
  Container,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';

const Footer = () => {
  return (
    <Box
      bg={useColorModeValue('gray.50', 'gray.900')}
      color={useColorModeValue('gray.700', 'gray.200')}
    >
      <Container
        as={Stack}
        maxW={'6xl'}
        py={4}
        direction={{ base: 'column', md: 'row' }}
        spacing={4}
        justify={{ base: 'center', md: 'space-between' }}
        align={{ base: 'center', md: 'center' }}
      >
        <Text>© 2024 Location Voiture. Tous droits réservés</Text>
        <Stack direction={'row'} spacing={6}>
          <Text as="a" href="#">Conditions</Text>
          <Text as="a" href="#">Politique de confidentialité</Text>
          <Text as="a" href="#">Contact</Text>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer; 